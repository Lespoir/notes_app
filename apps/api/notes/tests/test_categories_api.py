"""
API contract tests for the categories endpoint (task 2A).

Endpoint covered:
  GET /api/v1/categories/   — list categories for the authenticated user

These tests verify:
  - HTTP status codes
  - Response shape (required fields present)
  - Auth wiring (unauthenticated requests are rejected)
  - note_count annotation is included in every item
  - Only the requesting user's categories are returned
  - OpenAPI schema presence for the categories tag
"""

import json

import yaml
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import User
from notes.models import Category, Note


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

CATEGORIES_URL = "/api/v1/categories/"
REGISTER_URL = "/api/v1/auth/register/"
LOGIN_URL = "/api/v1/auth/login/"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_user(email="user@example.com", password="StrongPass123!"):
    return User.objects.create_user(email=email, password=password)


def _make_category(user, title="Test Category", color="#AABBCC"):
    return Category.objects.create(title=title, color=color, user=user)


def _make_note(user, category=None, title="A note"):
    return Note.objects.create(title=title, content="", owner=user, category=category)


def _authenticated_client(email="auth@example.com", password="StrongPass123!"):
    """Return an APIClient already authenticated via token auth."""
    user = _make_user(email=email, password=password)
    client = APIClient()
    response = client.post(LOGIN_URL, {"email": email, "password": password}, format="json")
    token = response.json().get("key")
    client.credentials(HTTP_AUTHORIZATION=f"Token {token}")
    return client, user


# ---------------------------------------------------------------------------
# Authentication wiring
# ---------------------------------------------------------------------------

class CategoriesEndpointAuthTest(TestCase):
    """Verify authentication requirements for GET /api/v1/categories/."""

    def test_unauthenticated_request_returns_401(self):
        """An unauthenticated GET returns HTTP 401 Unauthorized."""
        client = APIClient()

        response = client.get(CATEGORIES_URL, format="json")

        self.assertEqual(response.status_code, 401)

    def test_authenticated_request_returns_200(self):
        """An authenticated GET returns HTTP 200 OK."""
        client, _ = _authenticated_client(email="auth200@example.com")

        response = client.get(CATEGORIES_URL, format="json")

        self.assertEqual(response.status_code, 200)

    def test_endpoint_exists_and_is_not_404(self):
        """The /api/v1/categories/ URL is registered (not 404)."""
        client = APIClient()

        response = client.get(CATEGORIES_URL, format="json")

        self.assertNotEqual(response.status_code, 404)


# ---------------------------------------------------------------------------
# Response shape
# ---------------------------------------------------------------------------

class CategoriesEndpointResponseShapeTest(TestCase):
    """Verify the response body structure of GET /api/v1/categories/."""

    def setUp(self):
        self.client, self.user = _authenticated_client(email="shape@example.com")
        self.category = _make_category(self.user, title="Personal", color="#E74C3C")

    def test_response_body_is_a_list(self):
        """The response body is a JSON array."""
        response = self.client.get(CATEGORIES_URL, format="json")

        self.assertIsInstance(response.json(), list)

    def test_each_item_has_id_field(self):
        """Every category item includes an 'id' field."""
        response = self.client.get(CATEGORIES_URL, format="json")

        for item in response.json():
            self.assertIn("id", item, msg=f"Missing 'id' in item: {item}")

    def test_each_item_has_title_field(self):
        """Every category item includes a 'title' field."""
        response = self.client.get(CATEGORIES_URL, format="json")

        for item in response.json():
            self.assertIn("title", item, msg=f"Missing 'title' in item: {item}")

    def test_each_item_has_color_field(self):
        """Every category item includes a 'color' field."""
        response = self.client.get(CATEGORIES_URL, format="json")

        for item in response.json():
            self.assertIn("color", item, msg=f"Missing 'color' in item: {item}")

    def test_each_item_has_note_count_field(self):
        """Every category item includes a 'note_count' field."""
        response = self.client.get(CATEGORIES_URL, format="json")

        for item in response.json():
            self.assertIn("note_count", item, msg=f"Missing 'note_count' in item: {item}")

    def test_title_field_matches_stored_value(self):
        """The 'title' field in the response matches the category title."""
        response = self.client.get(CATEGORIES_URL, format="json")

        titles = [item["title"] for item in response.json()]
        self.assertIn("Personal", titles)

    def test_color_field_matches_stored_value(self):
        """The 'color' field in the response matches the category color."""
        response = self.client.get(CATEGORIES_URL, format="json")

        colors = [item["color"] for item in response.json()]
        self.assertIn("#E74C3C", colors)

    def test_note_count_is_an_integer(self):
        """The 'note_count' value is an integer."""
        response = self.client.get(CATEGORIES_URL, format="json")

        for item in response.json():
            self.assertIsInstance(
                item["note_count"],
                int,
                msg=f"'note_count' is not an int in item: {item}",
            )


# ---------------------------------------------------------------------------
# note_count annotation correctness
# ---------------------------------------------------------------------------

class CategoriesNoteCountTest(TestCase):
    """Verify note_count values returned by GET /api/v1/categories/."""

    def setUp(self):
        self.client, self.user = _authenticated_client(email="notecount@example.com")

    def test_note_count_is_zero_for_empty_category(self):
        """A category with no notes returns note_count=0."""
        _make_category(self.user, title="Empty", color="#AAAAAA")

        response = self.client.get(CATEGORIES_URL, format="json")

        item = next(i for i in response.json() if i["title"] == "Empty")
        self.assertEqual(item["note_count"], 0)

    def test_note_count_reflects_assigned_notes(self):
        """note_count equals the number of notes in that category."""
        cat = _make_category(self.user, title="School", color="#1ABC9C")
        _make_note(self.user, category=cat, title="Note 1")
        _make_note(self.user, category=cat, title="Note 2")

        response = self.client.get(CATEGORIES_URL, format="json")

        item = next(i for i in response.json() if i["title"] == "School")
        self.assertEqual(item["note_count"], 2)

    def test_note_count_is_independent_per_category(self):
        """note_count for one category is not affected by notes in another."""
        cat_a = _make_category(self.user, title="Work", color="#111111")
        cat_b = _make_category(self.user, title="Hobbies", color="#222222")
        _make_note(self.user, category=cat_a)
        _make_note(self.user, category=cat_b)
        _make_note(self.user, category=cat_b)

        response = self.client.get(CATEGORIES_URL, format="json")
        data = {item["title"]: item["note_count"] for item in response.json()}

        self.assertEqual(data["Work"], 1)
        self.assertEqual(data["Hobbies"], 2)


# ---------------------------------------------------------------------------
# Isolation — only the requesting user's categories are returned
# ---------------------------------------------------------------------------

class CategoriesEndpointIsolationTest(TestCase):
    """Verify that each user only sees their own categories."""

    def test_user_only_sees_their_own_categories(self):
        """GET /api/v1/categories/ returns only the authenticated user's categories."""
        client_a, user_a = _authenticated_client(email="isolation_a@example.com")
        _client_b, user_b = _authenticated_client(email="isolation_b@example.com")

        _make_category(user_a, title="A's Category", color="#AAAAAA")
        _make_category(user_b, title="B's Category", color="#BBBBBB")

        response = client_a.get(CATEGORIES_URL, format="json")
        titles = [item["title"] for item in response.json()]

        self.assertIn("A's Category", titles)
        self.assertNotIn("B's Category", titles)

    def test_empty_list_returned_when_user_has_no_categories(self):
        """A user with no categories receives an empty list."""
        # Create a fresh user who has no categories (bypass register_user hook
        # by directly creating the user without the action).
        user = User.objects.create_user(
            email="nocats@example.com", password="StrongPass123!"
        )
        client = APIClient()
        response = client.post(
            LOGIN_URL,
            {"email": "nocats@example.com", "password": "StrongPass123!"},
            format="json",
        )
        token = response.json().get("key")
        client.credentials(HTTP_AUTHORIZATION=f"Token {token}")

        # Ensure no categories exist for this user
        Category.objects.filter(user=user).delete()

        api_response = client.get(CATEGORIES_URL, format="json")
        self.assertEqual(api_response.json(), [])


# ---------------------------------------------------------------------------
# Default categories created on registration
# ---------------------------------------------------------------------------

class RegistrationCreatesDefaultCategoriesEndpointTest(TestCase):
    """Verify that after registration the list endpoint returns the 3 default categories."""

    DEFAULT_TITLES = {"Random Thoughts", "School", "Personal"}

    def _register_and_authenticate(self, email="regdefault@example.com"):
        """Register a user via the API and return an authenticated client."""
        client = APIClient()
        client.post(
            REGISTER_URL,
            {"email": email, "password1": "StrongPass123!", "password2": "StrongPass123!"},
            format="json",
        )
        login_response = client.post(
            LOGIN_URL,
            {"email": email, "password": "StrongPass123!"},
            format="json",
        )
        token = login_response.json().get("key")
        client.credentials(HTTP_AUTHORIZATION=f"Token {token}")
        return client

    def test_categories_endpoint_returns_three_items_after_registration(self):
        """After registering, the categories endpoint returns exactly 3 items."""
        client = self._register_and_authenticate(email="reg3@example.com")

        response = client.get(CATEGORIES_URL, format="json")

        self.assertEqual(len(response.json()), 3)

    def test_categories_endpoint_returns_all_default_category_titles(self):
        """After registering, the 3 default category titles are present in the response."""
        client = self._register_and_authenticate(email="regtitles@example.com")

        response = client.get(CATEGORIES_URL, format="json")
        returned_titles = {item["title"] for item in response.json()}

        self.assertEqual(returned_titles, self.DEFAULT_TITLES)

    def test_default_categories_each_have_a_color(self):
        """After registering, every default category has a non-empty color."""
        client = self._register_and_authenticate(email="regcolor@example.com")

        response = client.get(CATEGORIES_URL, format="json")

        for item in response.json():
            self.assertTrue(
                item.get("color"),
                msg=f"Category '{item.get('title')}' is missing a color.",
            )

    def test_default_categories_start_with_zero_notes(self):
        """After registering, every default category has note_count=0."""
        client = self._register_and_authenticate(email="regnotes@example.com")

        response = client.get(CATEGORIES_URL, format="json")

        for item in response.json():
            self.assertEqual(
                item["note_count"],
                0,
                msg=f"Category '{item['title']}' should start with 0 notes.",
            )


# ---------------------------------------------------------------------------
# OpenAPI schema presence
# ---------------------------------------------------------------------------

def _load_schema(client):
    """Fetch and parse the OpenAPI schema from the running server."""
    response = client.get("/api/v1/schema/")
    content_type = response.get("Content-Type", "")
    if "json" in content_type:
        return json.loads(response.content)
    return yaml.safe_load(response.content)


class CategoriesOpenAPISchemaTest(TestCase):
    """Verify that the categories endpoint is annotated in the OpenAPI schema."""

    def setUp(self):
        self.client = APIClient()

    def test_openapi_schema_includes_categories_path(self):
        """The generated OpenAPI schema contains the /api/v1/categories/ path."""
        schema = _load_schema(self.client)

        paths = schema.get("paths", {})
        self.assertIn("/api/v1/categories/", paths)

    def test_categories_path_has_get_operation(self):
        """The /api/v1/categories/ path in the schema defines a GET operation."""
        schema = _load_schema(self.client)

        categories_path = schema.get("paths", {}).get("/api/v1/categories/", {})
        self.assertIn("get", categories_path)

    def test_categories_get_operation_has_categories_tag(self):
        """The GET /api/v1/categories/ operation is tagged with 'categories'."""
        schema = _load_schema(self.client)

        get_op = (
            schema.get("paths", {})
            .get("/api/v1/categories/", {})
            .get("get", {})
        )
        tags = get_op.get("tags", [])
        self.assertIn("categories", tags)

    def test_categories_get_operation_documents_200_response(self):
        """The GET /api/v1/categories/ operation documents a 200 response."""
        schema = _load_schema(self.client)

        get_op = (
            schema.get("paths", {})
            .get("/api/v1/categories/", {})
            .get("get", {})
        )
        responses = get_op.get("responses", {})
        self.assertIn("200", responses)

    def test_categories_get_operation_documents_401_response(self):
        """The GET /api/v1/categories/ operation documents a 401 response."""
        schema = _load_schema(self.client)

        get_op = (
            schema.get("paths", {})
            .get("/api/v1/categories/", {})
            .get("get", {})
        )
        responses = get_op.get("responses", {})
        self.assertIn("401", responses)
