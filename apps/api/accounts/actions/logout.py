"""
Action: invalidate a user's auth token.

Deletes the token so it can no longer be used for authentication.
"""
from django.apps import apps


def logout_user(*, token: str) -> None:
    """
    Delete the given auth token, effectively logging out the user.
    """
    Token = apps.get_model("authtoken", "Token")
    Token.objects.filter(key=token).delete()
