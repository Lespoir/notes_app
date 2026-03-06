"""
API contract tests for auth endpoints (task 1A).

Endpoints covered:
  POST /api/v1/auth/register/   — sign up
  POST /api/v1/auth/login/      — login
  POST /api/v1/auth/logout/     — logout
  POST /api/v1/auth/token/refresh/  — token refresh (JWT) OR
       /api/v1/auth/token/refresh/  depending on configuration

These tests verify:
  - HTTP status codes
  - Response shape (required keys present)
  - Auth wiring (unauthenticated vs authenticated access)
  - Error responses for bad input
"""

from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import User


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

REGISTER_URL = "/api/v1/auth/register/"
LOGIN_URL = "/api/v1/auth/login/"
LOGOUT_URL = "/api/v1/auth/logout/"
TOKEN_REFRESH_URL = "/api/v1/auth/token/refresh/"


def _make_user(email="existing@example.com", password="ExistingPass123!"):
    return User.objects.create_user(email=email, password=password)


def _register(client, email="new@example.com", password="NewPass123!", password2=None):
    payload = {"email": email, "password1": password, "password2": password2 or password}
    return client.post(REGISTER_URL, payload, format="json")


def _login(client, email="existing@example.com", password="ExistingPass123!"):
    payload = {"email": email, "password": password}
    return client.post(LOGIN_URL, payload, format="json")


# ---------------------------------------------------------------------------
# Register endpoint
# ---------------------------------------------------------------------------

class RegisterEndpointTest(TestCase):
    """API contract tests for POST /api/v1/auth/register/."""

    def setUp(self):
        self.client = APIClient()

    def test_register_returns_201_for_valid_payload(self):
        """Valid sign-up payload returns HTTP 201 Created."""
        response = _register(self.client)

        self.assertEqual(response.status_code, 201)

    def test_register_response_contains_token_key(self):
        """The register response body includes an auth token."""
        response = _register(self.client)

        data = response.json()
        self.assertIn("key", data)

    def test_register_token_is_non_empty_string(self):
        """The token returned on registration is a non-empty string."""
        response = _register(self.client)

        token = response.json().get("key", "")
        self.assertIsInstance(token, str)
        self.assertTrue(len(token) > 0)

    def test_register_creates_user_in_database(self):
        """After successful registration a User record exists in the database."""
        email = "signup@example.com"
        _register(self.client, email=email)

        self.assertTrue(User.objects.filter(email=email).exists())

    def test_register_returns_409_for_duplicate_email(self):
        """Registering with an already-taken email returns HTTP 409 Conflict."""
        email = "dupe@example.com"
        _make_user(email=email)

        response = _register(self.client, email=email)

        self.assertEqual(response.status_code, 409)

    def test_register_returns_400_for_missing_email(self):
        """Omitting the email field returns HTTP 400."""
        payload = {"password1": "SomePass123!", "password2": "SomePass123!"}
        response = self.client.post(REGISTER_URL, payload, format="json")

        self.assertEqual(response.status_code, 400)

    def test_register_returns_400_for_missing_password(self):
        """Omitting the password fields returns HTTP 400."""
        payload = {"email": "nopass@example.com"}
        response = self.client.post(REGISTER_URL, payload, format="json")

        self.assertEqual(response.status_code, 400)

    def test_register_returns_400_when_passwords_do_not_match(self):
        """Mismatched password1 and password2 returns HTTP 400."""
        response = _register(
            self.client,
            password="CorrectPass123!",
            password2="WrongPass123!",
        )

        self.assertEqual(response.status_code, 400)

    def test_register_returns_422_for_weak_password(self):
        """A too-simple password is rejected with HTTP 422 Unprocessable Entity."""
        response = _register(self.client, password="password", password2="password")

        self.assertEqual(response.status_code, 422)

    def test_register_endpoint_is_publicly_accessible(self):
        """The register endpoint does not require prior authentication."""
        # An unauthenticated client should be able to reach the endpoint.
        # A 201 or 400 (bad input) both confirm the endpoint is reachable.
        response = self.client.post(REGISTER_URL, {}, format="json")

        self.assertNotEqual(response.status_code, 401)
        self.assertNotEqual(response.status_code, 403)
        self.assertNotEqual(response.status_code, 404)


# ---------------------------------------------------------------------------
# Login endpoint
# ---------------------------------------------------------------------------

class LoginEndpointTest(TestCase):
    """API contract tests for POST /api/v1/auth/login/."""

    def setUp(self):
        self.client = APIClient()
        self.email = "loginuser@example.com"
        self.password = "LoginPass123!"
        _make_user(email=self.email, password=self.password)

    def test_login_returns_200_for_valid_credentials(self):
        """Valid credentials return HTTP 200 OK."""
        response = _login(self.client, email=self.email, password=self.password)

        self.assertEqual(response.status_code, 200)

    def test_login_response_contains_token_key(self):
        """The login response body includes an auth token under 'key'."""
        response = _login(self.client, email=self.email, password=self.password)

        data = response.json()
        self.assertIn("key", data)

    def test_login_token_is_non_empty_string(self):
        """The token returned on login is a non-empty string."""
        response = _login(self.client, email=self.email, password=self.password)

        token = response.json().get("key", "")
        self.assertIsInstance(token, str)
        self.assertTrue(len(token) > 0)

    def test_login_returns_400_for_wrong_password(self):
        """Wrong password returns HTTP 400."""
        response = _login(self.client, email=self.email, password="WrongPassword!")

        self.assertEqual(response.status_code, 400)

    def test_login_returns_400_for_nonexistent_email(self):
        """A login attempt with an email not in the system returns HTTP 400."""
        response = _login(self.client, email="nobody@example.com", password="AnyPass123!")

        self.assertEqual(response.status_code, 400)

    def test_login_returns_400_for_missing_credentials(self):
        """Submitting an empty payload returns HTTP 400."""
        response = self.client.post(LOGIN_URL, {}, format="json")

        self.assertEqual(response.status_code, 400)

    def test_login_endpoint_is_publicly_accessible(self):
        """The login endpoint does not require prior authentication."""
        response = self.client.post(LOGIN_URL, {}, format="json")

        self.assertNotEqual(response.status_code, 401)
        self.assertNotEqual(response.status_code, 403)
        self.assertNotEqual(response.status_code, 404)

    def test_login_inactive_user_returns_400(self):
        """An inactive user cannot log in."""
        User.objects.filter(email=self.email).update(is_active=False)

        response = _login(self.client, email=self.email, password=self.password)

        self.assertEqual(response.status_code, 400)


# ---------------------------------------------------------------------------
# Logout endpoint
# ---------------------------------------------------------------------------

class LogoutEndpointTest(TestCase):
    """API contract tests for POST /api/v1/auth/logout/."""

    def setUp(self):
        self.client = APIClient()
        self.email = "logoutuser@example.com"
        self.password = "LogoutPass123!"
        _make_user(email=self.email, password=self.password)

    def _authenticate(self):
        """Log in and configure the client with the returned token."""
        response = _login(self.client, email=self.email, password=self.password)
        token = response.json().get("key")
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token}")
        return token

    def test_logout_returns_200_for_authenticated_user(self):
        """An authenticated user can log out and receives HTTP 200."""
        self._authenticate()

        response = self.client.post(LOGOUT_URL, format="json")

        self.assertEqual(response.status_code, 200)

    def test_logout_returns_401_for_unauthenticated_request(self):
        """Posting to logout without a token returns HTTP 401."""
        response = self.client.post(LOGOUT_URL, format="json")

        self.assertEqual(response.status_code, 401)

    def test_logout_invalidates_token(self):
        """After logging out, the same token can no longer be used."""
        token = self._authenticate()

        self.client.post(LOGOUT_URL, format="json")

        # Try to use the invalidated token
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token}")
        response = self.client.post(LOGOUT_URL, format="json")

        self.assertEqual(response.status_code, 401)

    def test_logout_endpoint_exists(self):
        """The logout URL is registered and returns a non-404 response."""
        self._authenticate()
        response = self.client.post(LOGOUT_URL, format="json")

        self.assertNotEqual(response.status_code, 404)


# ---------------------------------------------------------------------------
# Token refresh endpoint
# ---------------------------------------------------------------------------

class TokenRefreshEndpointTest(TestCase):
    """API contract tests for the token refresh endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.email = "refreshuser@example.com"
        self.password = "RefreshPass123!"
        _make_user(email=self.email, password=self.password)

    def test_token_refresh_endpoint_exists(self):
        """The token refresh URL is registered and returns a non-404 response."""
        # POST with no body — we expect 400 (bad input) not 404 (not found)
        response = self.client.post(TOKEN_REFRESH_URL, {}, format="json")

        self.assertNotEqual(response.status_code, 404)

    def test_token_refresh_returns_400_for_missing_token(self):
        """Posting to token refresh without a refresh token returns HTTP 400."""
        response = self.client.post(TOKEN_REFRESH_URL, {}, format="json")

        self.assertIn(response.status_code, [400, 401])


# ---------------------------------------------------------------------------
# OpenAPI schema presence tests for auth tag
# ---------------------------------------------------------------------------

class AuthOpenAPISchemaTest(TestCase):
    """Verify that auth endpoints are annotated and appear in the OpenAPI schema."""

    def setUp(self):
        self.client = APIClient()

    def test_openapi_schema_includes_auth_register_path(self):
        """The generated OpenAPI schema contains the /api/v1/auth/register/ path."""
        import yaml

        response = self.client.get("/api/v1/schema/")
        content_type = response.get("Content-Type", "")

        if "json" in content_type:
            import json
            schema = json.loads(response.content)
        else:
            schema = yaml.safe_load(response.content)

        paths = schema.get("paths", {})
        self.assertIn("/api/v1/auth/register/", paths)

    def test_openapi_schema_includes_auth_login_path(self):
        """The generated OpenAPI schema contains the /api/v1/auth/login/ path."""
        import yaml

        response = self.client.get("/api/v1/schema/")
        content_type = response.get("Content-Type", "")

        if "json" in content_type:
            import json
            schema = json.loads(response.content)
        else:
            schema = yaml.safe_load(response.content)

        paths = schema.get("paths", {})
        self.assertIn("/api/v1/auth/login/", paths)

    def test_openapi_schema_includes_auth_logout_path(self):
        """The generated OpenAPI schema contains the /api/v1/auth/logout/ path."""
        import yaml

        response = self.client.get("/api/v1/schema/")
        content_type = response.get("Content-Type", "")

        if "json" in content_type:
            import json
            schema = json.loads(response.content)
        else:
            schema = yaml.safe_load(response.content)

        paths = schema.get("paths", {})
        self.assertIn("/api/v1/auth/logout/", paths)

    def test_openapi_schema_auth_register_has_post_operation(self):
        """The register path in the schema has a POST operation defined."""
        import yaml

        response = self.client.get("/api/v1/schema/")
        content_type = response.get("Content-Type", "")

        if "json" in content_type:
            import json
            schema = json.loads(response.content)
        else:
            schema = yaml.safe_load(response.content)

        register_path = schema.get("paths", {}).get("/api/v1/auth/register/", {})
        self.assertIn("post", register_path)

    def test_openapi_schema_auth_login_has_post_operation(self):
        """The login path in the schema has a POST operation defined."""
        import yaml

        response = self.client.get("/api/v1/schema/")
        content_type = response.get("Content-Type", "")

        if "json" in content_type:
            import json
            schema = json.loads(response.content)
        else:
            schema = yaml.safe_load(response.content)

        login_path = schema.get("paths", {}).get("/api/v1/auth/login/", {})
        self.assertIn("post", login_path)

    def test_openapi_schema_auth_logout_has_post_operation(self):
        """The logout path in the schema has a POST operation defined."""
        import yaml

        response = self.client.get("/api/v1/schema/")
        content_type = response.get("Content-Type", "")

        if "json" in content_type:
            import json
            schema = json.loads(response.content)
        else:
            schema = yaml.safe_load(response.content)

        logout_path = schema.get("paths", {}).get("/api/v1/auth/logout/", {})
        self.assertIn("post", logout_path)
