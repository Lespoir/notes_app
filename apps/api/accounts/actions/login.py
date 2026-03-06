"""
Action: authenticate a user and return an auth token.

Raises ValidationError if credentials are invalid or the account is inactive.
Returns a (User, token_string) tuple on success.
"""
from django.apps import apps
from django.contrib.auth import authenticate

from lib.errors import ValidationError


def login_user(*, email: str, password: str):
    """
    Authenticate the user and return a (User, token) tuple.

    Raises:
        ValidationError: if the credentials are incorrect or the account is inactive.
    """
    Token = apps.get_model("authtoken", "Token")

    user = authenticate(username=email, password=password)
    if user is None:
        raise ValidationError(
            message="Invalid email or password.",
            details={"non_field_errors": ["Unable to log in with provided credentials."]},
        )

    token, _ = Token.objects.get_or_create(user=user)
    return user, token.key
