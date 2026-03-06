"""
Action: register a new user.

Raises ConflictError if the email is already taken.
Raises ValidationError if the email or password are invalid.
Returns the newly created User instance.
"""
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email

from accounts.models import User
from lib.errors import ConflictError, ValidationError


def register_user(*, email: str, password: str) -> User:
    """
    Create and return a new active user with the given credentials.

    Raises:
        ValidationError: if the email or password are invalid.
        ConflictError: if the email address is already registered.
    """
    if not email:
        raise ValidationError(
            message="Email is required.",
            details={"email": ["This field may not be blank."]},
        )

    try:
        validate_email(email)
    except DjangoValidationError:
        raise ValidationError(
            message="Enter a valid email address.",
            details={"email": ["Enter a valid email address."]},
        )

    try:
        validate_password(password)
    except DjangoValidationError as exc:
        raise ValidationError(
            message="Password is too weak.",
            details={"password": list(exc.messages)},
        )

    if User.objects.filter(email__iexact=email).exists():
        raise ConflictError(
            message="An account with this email already exists.",
            details={"email": ["An account with this email already exists."]},
        )

    user = User.objects.create_user(email=email, password=password)

    # Seed default categories for the new user.
    # Side effects for a new user registration are explicit here in the action,
    # not scattered across serializers or signals.
    from notes.actions.seed_categories import seed_default_categories
    seed_default_categories(user=user)

    return user
