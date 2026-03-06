"""
Serializers for the accounts API.

These define the exact request/response shapes that drive the OpenAPI spec
consumed by the frontend via Orval.
"""
from dj_rest_auth.serializers import LoginSerializer
from rest_framework import serializers


# ---------------------------------------------------------------------------
# Register
# ---------------------------------------------------------------------------

class RegisterInputSchema(serializers.Serializer):
    """Input schema for POST /api/v1/auth/register/."""

    email = serializers.EmailField(required=True)
    password1 = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
        min_length=8,
    )
    password2 = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
        min_length=8,
    )

    def validate(self, data):
        if data["password1"] != data["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return data

    def get_cleaned_data(self):
        return {
            "email": self.validated_data.get("email", ""),
            "password1": self.validated_data.get("password1", ""),
        }

    def save(self, request):
        # dj-rest-auth calls save() on the registration serializer.
        # Delegate to our action so business logic stays in the right layer.
        # The action handles all side effects including seeding default categories.
        from accounts.actions.register import register_user

        email = self.validated_data["email"]
        password = self.validated_data["password1"]
        return register_user(email=email, password=password)


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

class LoginInputSchema(LoginSerializer):
    """
    Override dj-rest-auth's default LoginSerializer to remove the username
    field (our user model uses email only) and keep the OpenAPI spec clean.
    """

    username = None  # remove username field inherited from LoginSerializer
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )


# ---------------------------------------------------------------------------
# Token (login / register response)
# ---------------------------------------------------------------------------

class TokenOutputSchema(serializers.Serializer):
    """Response schema for login and register endpoints — returns an auth token."""

    key = serializers.CharField(read_only=True)


# ---------------------------------------------------------------------------
# User detail (nested in some responses)
# ---------------------------------------------------------------------------

class UserOutputSchema(serializers.Serializer):
    """Minimal user representation returned alongside the auth token."""

    id = serializers.UUIDField(read_only=True)
    email = serializers.EmailField(read_only=True)
