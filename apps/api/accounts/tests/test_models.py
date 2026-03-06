from django.test import TestCase


class UserModelTest(TestCase):
    """Tests for the custom User model stub delivered by task 0A."""

    def test_user_model_exists(self):
        """The custom User model can be imported from accounts.models."""
        from accounts.models import User  # noqa: F401

    def test_user_uses_email_as_username(self):
        """The custom User model uses email as the username field."""
        from accounts.models import User

        self.assertEqual(User.USERNAME_FIELD, "email")

    def test_user_can_be_created_with_email(self):
        """A user can be created with an email address."""
        from accounts.models import User

        user = User.objects.create_user(
            email="test@example.com",
            password="securepassword123",
        )

        self.assertEqual(user.email, "test@example.com")

    def test_user_email_is_unique(self):
        """Two users cannot share the same email address."""
        from accounts.models import User
        from django.db import IntegrityError

        User.objects.create_user(email="unique@example.com", password="pass1")

        with self.assertRaises(IntegrityError):
            User.objects.create_user(email="unique@example.com", password="pass2")

    def test_auth_user_model_setting_points_to_accounts_user(self):
        """The AUTH_USER_MODEL Django setting points to accounts.User."""
        from django.conf import settings

        self.assertEqual(settings.AUTH_USER_MODEL, "accounts.User")

    def test_user_has_no_username_field(self):
        """The custom User model does not use a separate username field."""
        from accounts.models import User

        # USERNAME_FIELD must be email, meaning there is no separate username
        self.assertNotEqual(User.USERNAME_FIELD, "username")

    def test_required_fields_do_not_include_email(self):
        """Email is the USERNAME_FIELD so it should not appear in REQUIRED_FIELDS."""
        from accounts.models import User

        self.assertNotIn("email", User.REQUIRED_FIELDS)
