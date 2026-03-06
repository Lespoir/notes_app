"""
Unit tests for accounts auth actions (task 1A).

These tests cover the business layer only — no HTTP/DRF concepts.
Actions tested:
  - register_user(email, password) -> User
  - login_user(email, password) -> (User, token)
  - logout_user(token) -> None
"""

from django.test import TestCase

from accounts.models import User


class RegisterUserActionTest(TestCase):
    """Unit tests for the register_user action."""

    def _call(self, email="user@example.com", password="StrongPass123!"):
        from accounts.actions import register_user

        return register_user(email=email, password=password)

    def test_register_user_returns_user_instance(self):
        """register_user returns a User model instance."""
        user = self._call()

        self.assertIsInstance(user, User)

    def test_register_user_persists_to_database(self):
        """register_user saves the user to the database."""
        self._call(email="db@example.com")

        self.assertTrue(User.objects.filter(email="db@example.com").exists())

    def test_register_user_stores_email_correctly(self):
        """register_user saves the provided email on the new user."""
        user = self._call(email="correct@example.com")

        self.assertEqual(user.email, "correct@example.com")

    def test_register_user_does_not_store_plain_text_password(self):
        """register_user hashes the password — the raw value is never stored."""
        raw_password = "PlainTextPassword99!"
        user = self._call(password=raw_password)

        self.assertNotEqual(user.password, raw_password)

    def test_register_user_password_is_usable(self):
        """The stored hashed password is verifiable with check_password."""
        raw_password = "VerifiablePass77!"
        user = self._call(password=raw_password)

        self.assertTrue(user.check_password(raw_password))

    def test_register_user_duplicate_email_raises_error(self):
        """register_user raises an error when the email is already taken."""
        from accounts.actions import register_user

        self._call(email="taken@example.com")

        with self.assertRaises(Exception):
            register_user(email="taken@example.com", password="AnotherPass123!")

    def test_register_user_normalises_email(self):
        """register_user normalises the email domain to lowercase."""
        user = self._call(email="User@EXAMPLE.COM")

        self.assertEqual(user.email, "User@example.com")

    def test_register_user_empty_email_raises_error(self):
        """register_user raises an error when email is empty."""
        from accounts.actions import register_user

        with self.assertRaises(Exception):
            register_user(email="", password="SomePass123!")

    def test_register_user_weak_password_raises_error(self):
        """register_user raises an error when the password fails Django validators."""
        from accounts.actions import register_user

        with self.assertRaises(Exception):
            # "password" is a common password rejected by CommonPasswordValidator
            register_user(email="weak@example.com", password="password")

    def test_register_user_new_user_is_active(self):
        """A newly registered user is active by default."""
        user = self._call(email="active@example.com")

        self.assertTrue(user.is_active)

    def test_register_user_new_user_is_not_staff(self):
        """A newly registered user does not have staff privileges."""
        user = self._call(email="nostaff@example.com")

        self.assertFalse(user.is_staff)


class LoginUserActionTest(TestCase):
    """Unit tests for the login_user action."""

    def setUp(self):
        self.email = "login@example.com"
        self.password = "LoginPass123!"
        User.objects.create_user(email=self.email, password=self.password)

    def _call(self, email=None, password=None):
        from accounts.actions import login_user

        return login_user(
            email=email or self.email,
            password=password or self.password,
        )

    def test_login_user_returns_token(self):
        """login_user returns an auth token for valid credentials."""
        result = self._call()

        # Result is either a token string or a (user, token) tuple — both are acceptable.
        # We assert a non-empty token string is present somewhere in the result.
        if isinstance(result, tuple):
            _user, token = result
        else:
            token = result

        self.assertTrue(token)
        self.assertIsInstance(token, str)

    def test_login_user_returns_user_for_valid_credentials(self):
        """login_user returns the matching User when credentials are correct."""
        result = self._call()

        if isinstance(result, tuple):
            user, _token = result
            self.assertIsInstance(user, User)
            self.assertEqual(user.email, self.email)

    def test_login_user_wrong_password_raises_error(self):
        """login_user raises an error when the password is incorrect."""
        from accounts.actions import login_user

        with self.assertRaises(Exception):
            login_user(email=self.email, password="WrongPassword!")

    def test_login_user_nonexistent_email_raises_error(self):
        """login_user raises an error when the email does not exist."""
        from accounts.actions import login_user

        with self.assertRaises(Exception):
            login_user(email="nobody@example.com", password="SomePass123!")

    def test_login_user_inactive_user_raises_error(self):
        """login_user raises an error when the user account is inactive."""
        from accounts.actions import login_user

        User.objects.filter(email=self.email).update(is_active=False)

        with self.assertRaises(Exception):
            login_user(email=self.email, password=self.password)


class LogoutUserActionTest(TestCase):
    """Unit tests for the logout_user action."""

    def setUp(self):
        self.email = "logout@example.com"
        self.password = "LogoutPass123!"
        self.user = User.objects.create_user(email=self.email, password=self.password)

    def _get_token(self):
        from accounts.actions import login_user

        result = login_user(email=self.email, password=self.password)
        if isinstance(result, tuple):
            _user, token = result
            return token
        return result

    def test_logout_user_invalidates_token(self):
        """logout_user invalidates the token so it can no longer be used."""
        from accounts.actions import logout_user

        token = self._get_token()
        # Should not raise
        logout_user(token=token)

        # After logout, looking up the token should fail or return nothing.
        # We verify by checking the token no longer exists in the token store.
        from rest_framework.authtoken.models import Token

        self.assertFalse(Token.objects.filter(key=token).exists())

    def test_logout_user_completes_without_error_for_valid_token(self):
        """logout_user does not raise an exception for a valid, active token."""
        from accounts.actions import logout_user

        token = self._get_token()

        # Should complete silently
        try:
            logout_user(token=token)
        except Exception as exc:
            self.fail(f"logout_user raised an unexpected exception: {exc}")
