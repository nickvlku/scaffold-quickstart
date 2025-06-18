# backend/apps/common/utils.py
import secrets
import string

BASE62_ALPHABET = string.digits + string.ascii_letters # 0-9a-zA-Z

def generate_base62_id(length):
    """
    Generates a cryptographically secure Base62 string of a given length.
    """
    if length <= 0:
        raise ValueError("Length must be a positive integer.")
    return ''.join(secrets.choice(BASE62_ALPHABET) for _ in range(length))

# Example Usage:
# new_id = generate_base62_id(30) # Generates a 30-character Base62 string