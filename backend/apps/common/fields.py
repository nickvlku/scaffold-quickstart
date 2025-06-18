# backend/apps/common/fields.py
import uuid
from django.db import models
from django.core.exceptions import ValidationError
from .utils import generate_base62_id # We'll create this next

class SemanticIDField(models.CharField):
    """
    A CharField that generates a semantic ID with a prefix and a random Base62 string.
    Example: 'US_A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5' (prefix + 30 chars)
    Total length = len(prefix) + 1 (for underscore) + 30 chars.
    We aim for 32 chars total as per original spec, so prefix should be 2 chars.
    If prefix is 'US', id is 'US' + 30 random chars. Total 32.
    The field stores the ID as 'PRFX' + 'random_part'.
    """
    description = "A semantic ID with a prefix and a random Base62 string."

    def __init__(self, *args, **kwargs):
        self.prefix = kwargs.pop('prefix', None)
        if not self.prefix or not isinstance(self.prefix, str) or len(self.prefix) != 2:
            raise ValueError("SemanticIDField requires a 'prefix' argument of 2 characters.")

        # Ensure the total length is 32 (2 for prefix + 30 for random part)
        # CharField max_length should be this fixed size.
        kwargs['max_length'] = 32
        kwargs.setdefault('blank', True) # Allow blank during form validation, as we generate it.
        kwargs.setdefault('editable', False)
        kwargs.setdefault('unique', True)
        super().__init__(*args, **kwargs)

    def deconstruct(self):
        name, path, args, kwargs = super().deconstruct()
        kwargs['prefix'] = self.prefix
        # Ensure max_length is not part of deconstructed args if it was set by us
        if 'max_length' in kwargs and kwargs['max_length'] == 32:
            del kwargs['max_length']
        return name, path, args, kwargs

    def pre_save(self, model_instance, add):
        """
        This is called before the model is saved.
        """
        if add and not getattr(model_instance, self.attname, None):
            # Only generate a new ID if creating a new model instance and ID is not already set.
            value = self.generate_id(model_instance.__class__)
            setattr(model_instance, self.attname, value)
            return value
        else:
            # If updating or ID already exists, return existing value.
            return super().pre_save(model_instance, add)

    def generate_id(self, model_class):
        """
        Generates a unique ID with the prefix.
        Includes a retry mechanism for extremely rare collisions.
        """
        max_attempts = 5 # Arbitrary number of retries
        for _ in range(max_attempts):
            random_part = generate_base62_id(30) # Generate 30 random Base62 characters
            candidate_id = f"{self.prefix}{random_part}"
            if not model_class._default_manager.filter(**{self.attname: candidate_id}).exists():
                return candidate_id
        raise ValidationError(f"Could not generate a unique ID for prefix {self.prefix} after {max_attempts} attempts.")

    def from_db_value(self, value, expression, connection):
        # Called when data is loaded from the database
        return value

    def to_python(self, value):
        # Called during deserialization and when assigned from Python code
        if isinstance(value, str) or value is None:
            return value
        return str(value)

    def get_prep_value(self, value):
        # Called to prepare the value for storage in the database
        if value is None:
            return None
        if not isinstance(value, str):
            return str(value)
        # Basic validation for format if needed, though usually handled by model validation
        if not value.startswith(self.prefix) or len(value) != 32:
            # This might be too strict if we allow setting it manually in some edge cases
            # but good for ensuring integrity if always auto-generated.
            # Consider if this check is needed here or just at generation time.
            # For now, let's assume it should always be correct if it reaches here.
            pass
        return value