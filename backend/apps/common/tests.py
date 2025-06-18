# backend/apps/common/tests.py
from django.test import TestCase, TransactionTestCase
from django.db import models, connection
from django.core.exceptions import ValidationError
from unittest.mock import patch

from .fields import SemanticIDField
from .utils import generate_base62_id, BASE62_ALPHABET

# A dummy model for testing SemanticIDField
class TestModel(models.Model):
    id = SemanticIDField(prefix="TM", primary_key=True)
    name = models.CharField(max_length=100)

    class Meta:
        app_label = 'common' # Explicitly tie to the 'common' app for test DB creation

class Base62UtilTests(TestCase):
    def test_generate_base62_id_length(self):
        for length in [1, 10, 30, 100]:
            self.assertEqual(len(generate_base62_id(length)), length)

    def test_generate_base62_id_charset(self):
        generated_id = generate_base62_id(50)
        for char in generated_id:
            self.assertIn(char, BASE62_ALPHABET)

    def test_generate_base62_id_uniqueness_probabilistic(self):
        # Probabilistic test: generate many and check for high degree of uniqueness
        ids = {generate_base62_id(10) for _ in range(1000)}
        self.assertGreater(len(ids), 990) # Expect very few collisions for short strings

    def test_generate_base62_id_invalid_length(self):
        with self.assertRaises(ValueError):
            generate_base62_id(0)
        with self.assertRaises(ValueError):
            generate_base62_id(-5)

class SemanticIDFieldTests(TransactionTestCase):
    def test_field_instantiation_requires_prefix(self):
        with self.assertRaisesRegex(ValueError, "SemanticIDField requires a 'prefix' argument"):
            SemanticIDField()
        with self.assertRaisesRegex(ValueError, "prefix' argument of 2 characters"):
            SemanticIDField(prefix="T")
        with self.assertRaisesRegex(ValueError, "prefix' argument of 2 characters"):
            SemanticIDField(prefix="TOOLONG")
        with self.assertRaisesRegex(ValueError, "prefix' argument of 2 characters"):
            SemanticIDField(prefix=12)


    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # Manually create the table for TestModel
        # This ensures the table exists in the test database
        with connection.schema_editor() as schema_editor:
            schema_editor.create_model(TestModel)

    @classmethod
    def tearDownClass(cls):
        # Manually delete the table for TestModel after tests
        with connection.schema_editor() as schema_editor:
            schema_editor.delete_model(TestModel)
        super().tearDownClass()


    def test_id_generation_format(self):
        instance = TestModel.objects.create(name="Test Instance")
        self.assertIsNotNone(instance.id)
        self.assertTrue(instance.id.startswith("TM"))
        self.assertEqual(len(instance.id), 32) # TM + 30 random chars
        random_part = instance.id[2:]
        self.assertEqual(len(random_part), 30)
        for char in random_part:
            self.assertIn(char, BASE62_ALPHABET)

    def test_id_is_primary_key_and_not_editable(self):
        field = TestModel._meta.get_field('id')
        self.assertTrue(field.primary_key)
        self.assertFalse(field.editable)

    def test_id_is_unique_on_save(self):
        # This implicitly tests the unique=True constraint at DB level if DB supports it
        # and the retry logic if we mock it.
        instance1 = TestModel.objects.create(name="First")
        # Trying to save another with the same ID should fail if not for retry,
        # but our retry should find a new one.
        # Direct creation should always yield a unique ID.
        instance2 = TestModel.objects.create(name="Second")
        self.assertNotEqual(instance1.id, instance2.id)

    @patch('apps.common.fields.generate_base62_id')
    @patch.object(TestModel._default_manager, 'filter')
    def test_id_generation_collision_retry(self, mock_filter, mock_generate):
        # Simulate one collision then success
        # First call to generate_id: returns "COLLISION_ID_PART"
        # Second call to generate_id: returns "UNIQUE_ID_PART"
        mock_generate.side_effect = ["COLLISIONRNDPART0123456789ABCDEF", "UNIQUERANDOMPART0123456789ABCDEF"]

        # Mock filter().exists():
        # First time (for "TMCOLLISION..."), it exists.
        # Second time (for "TMUNIQUE..."), it does not exist.
        mock_exists_manager = mock_filter.return_value
        mock_exists_manager.exists.side_effect = [True, False]

        instance = TestModel.objects.create(name="Collision Test")

        self.assertEqual(instance.id, "TMUNIQUERANDOMPART0123456789ABCDEF")
        self.assertEqual(mock_generate.call_count, 2)
        mock_filter.assert_any_call(id="TMCOLLISIONRNDPART0123456789ABCDEF")
        mock_filter.assert_any_call(id="TMUNIQUERANDOMPART0123456789ABCDEF")

    @patch('apps.common.fields.generate_base62_id')
    @patch.object(TestModel._default_manager, 'filter')
    def test_id_generation_persistent_collision_failure(self, mock_filter, mock_generate):
        # Simulate persistent collisions
        mock_generate.return_value = "PERSISTCOLLISIONPART0123456789A" # Always the same
        mock_exists_manager = mock_filter.return_value
        mock_exists_manager.exists.return_value = True # Always exists

        with self.assertRaisesRegex(ValidationError, "Could not generate a unique ID for prefix TM after 5 attempts."):
            TestModel.objects.create(name="Persistent Collision Test")
        self.assertEqual(mock_generate.call_count, 5) # Default max_attempts

    def test_id_not_regenerated_on_update(self):
        instance = TestModel.objects.create(name="Initial Name")
        original_id = instance.id
        instance.name = "Updated Name"
        instance.save()
        instance.refresh_from_db()
        self.assertEqual(instance.id, original_id)

    def test_field_deconstruct(self):
        field = SemanticIDField(prefix="XX", primary_key=True)
        name, path, args, kwargs = field.deconstruct()
        self.assertEqual(path, "apps.common.fields.SemanticIDField")
        self.assertEqual(kwargs["prefix"], "XX")
        self.assertNotIn("max_length", kwargs) # max_length is managed internally

    def test_to_python_and_from_db_value(self):
        field = SemanticIDField(prefix="DB")
        self.assertEqual(field.to_python("DB123"), "DB123")
        self.assertIsNone(field.to_python(None))
        # from_db_value is usually identity for CharField unless specific conversion needed
        self.assertEqual(field.from_db_value("DB123", None, None), "DB123")

    def test_get_prep_value(self):
        field = SemanticIDField(prefix="PP")
        self.assertEqual(field.get_prep_value("PPsomevalue"), "PPsomevalue")
        self.assertIsNone(field.get_prep_value(None))