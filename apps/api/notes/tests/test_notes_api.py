"""
API contract tests for the notes endpoints (task 3A).

Endpoints covered:
  POST   /api/v1/notes/           — create note
  GET    /api/v1/notes/           — list notes (with optional category filter)
  GET    /api/v1/notes/{id}/      — retrieve note
  PATCH  /api/v1/notes/{id}/      — partial update note
  DELETE /api/v1/notes/{id}/      — delete note

These tests verify:
  - HTTP status codes
  - Response shape (required fields present)
  - Auth wiring (unauthenticated requests are rejected)
  - User isolation (users only see/modify their own notes)
  - Category filter query param on list endpoint
  - Ordering by last edited (most recent first) on list endpoint
  - Partial updates (PATCH accepts any subset of fields)
  - OpenAPI schema presence for the notes tag
"""

import json
import time
import uuid

import yaml
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import User
from notes.models import Category, Note


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

NOTES_URL = "/api/v1/notes/"
LOGIN_URL = "/api/v1/auth/login/"
SCHEMA_URL = "/api/v1/schema/"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_user(email="user@example.com", password="StrongPass123!"):
    return User.objects.create_user(email=email, password=password)


def _make_category(user, title="Work", color="#AABBCC"):
    return Category.objects.create(title=title, color=color, user=user)


def _make_note(owner, title="", content="", category=None):
    return Note.objects.create(title=title, content=content, owner=owner, category=category)


def _note_detail_url(note_id):
    return f"/api/v1/notes/{note_id}/"


def _authenticated_client(email, password="StrongPass123!"):
    """Return (APIClient, user) with token credentials already set."""
    user = _make_user(email=email, password=password)
    client = APIClient()
    response = client.post(LOGIN_URL, {"email": email, "password": password}, format="json")
    token = response.json().get("key")
    client.credentials(HTTP_AUTHORIZATION=f"Token {token}")
    return client, user


def _load_openapi_schema(client):
    """Fetch and parse the OpenAPI schema."""
    response = client.get(SCHEMA_URL)
    content_type = response.get("Content-Type", "")
    if "json" in content_type:
        return json.loads(response.content)
    return yaml.safe_load(response.content)


# ---------------------------------------------------------------------------
# Authentication wiring
# ---------------------------------------------------------------------------

class NotesEndpointAuthTest(TestCase):
    """Verify authentication requirements for all notes endpoints."""

    def setUp(self):
        self.anon = APIClient()
        self.user = _make_user(email="authtest@example.com")
        self.note = _make_note(self.user, title="Auth test note")

    def test_list_notes_unauthenticated_returns_401(self):
        """GET /api/v1/notes/ without auth returns 401."""
        response = self.anon.get(NOTES_URL)

        self.assertEqual(response.status_code, 401)

    def test_create_note_unauthenticated_returns_401(self):
        """POST /api/v1/notes/ without auth returns 401."""
        response = self.anon.post(NOTES_URL, {}, format="json")

        self.assertEqual(response.status_code, 401)

    def test_retrieve_note_unauthenticated_returns_401(self):
        """GET /api/v1/notes/{id}/ without auth returns 401."""
        response = self.anon.get(_note_detail_url(self.note.pk))

        self.assertEqual(response.status_code, 401)

    def test_update_note_unauthenticated_returns_401(self):
        """PATCH /api/v1/notes/{id}/ without auth returns 401."""
        response = self.anon.patch(_note_detail_url(self.note.pk), {}, format="json")

        self.assertEqual(response.status_code, 401)

    def test_delete_note_unauthenticated_returns_401(self):
        """DELETE /api/v1/notes/{id}/ without auth returns 401."""
        response = self.anon.delete(_note_detail_url(self.note.pk))

        self.assertEqual(response.status_code, 401)

    def test_notes_urls_are_registered(self):
        """Notes URLs exist and are not 404."""
        self.assertNotEqual(self.anon.get(NOTES_URL).status_code, 404)
        self.assertNotEqual(self.anon.get(_note_detail_url(self.note.pk)).status_code, 404)


# ---------------------------------------------------------------------------
# POST /api/v1/notes/ — create note
# ---------------------------------------------------------------------------

class CreateNoteEndpointTest(TestCase):
    """API contract tests for POST /api/v1/notes/."""

    def setUp(self):
        self.client, self.user = _authenticated_client(email="create@example.com")

    def test_create_returns_201(self):
        """POST /api/v1/notes/ returns HTTP 201 Created."""
        response = self.client.post(NOTES_URL, {}, format="json")

        self.assertEqual(response.status_code, 201)

    def test_create_note_with_no_body(self):
        """POST /api/v1/notes/ with an empty body succeeds (all fields default)."""
        response = self.client.post(NOTES_URL, {}, format="json")

        self.assertEqual(response.status_code, 201)

    def test_create_response_contains_id(self):
        """The create response includes an 'id' field."""
        response = self.client.post(NOTES_URL, {}, format="json")

        self.assertIn("id", response.json())

    def test_create_response_contains_title(self):
        """The create response includes a 'title' field."""
        response = self.client.post(NOTES_URL, {}, format="json")

        self.assertIn("title", response.json())

    def test_create_response_contains_content(self):
        """The create response includes a 'content' field."""
        response = self.client.post(NOTES_URL, {}, format="json")

        self.assertIn("content", response.json())

    def test_create_response_contains_category(self):
        """The create response includes a 'category' field (may be null)."""
        response = self.client.post(NOTES_URL, {}, format="json")

        data = response.json()
        self.assertIn("category", data)

    def test_create_response_contains_created_at(self):
        """The create response includes a 'created_at' field."""
        response = self.client.post(NOTES_URL, {}, format="json")

        self.assertIn("created_at", response.json())

    def test_create_response_contains_updated_at(self):
        """The create response includes an 'updated_at' field."""
        response = self.client.post(NOTES_URL, {}, format="json")

        self.assertIn("updated_at", response.json())

    def test_new_note_title_is_empty_by_default(self):
        """A note created without a title has title='' in the response."""
        response = self.client.post(NOTES_URL, {}, format="json")

        self.assertEqual(response.json()["title"], "")

    def test_new_note_content_is_empty_by_default(self):
        """A note created without content has content='' in the response."""
        response = self.client.post(NOTES_URL, {}, format="json")

        self.assertEqual(response.json()["content"], "")

    def test_new_note_category_is_null_by_default(self):
        """A note created without a category has category=null in the response."""
        response = self.client.post(NOTES_URL, {}, format="json")

        self.assertIsNone(response.json()["category"])

    def test_note_is_saved_to_database(self):
        """After POST, the note exists in the database."""
        response = self.client.post(NOTES_URL, {}, format="json")
        note_id = response.json()["id"]

        self.assertTrue(Note.objects.filter(pk=note_id).exists())

    def test_note_is_owned_by_requesting_user(self):
        """The created note is owned by the authenticated user."""
        response = self.client.post(NOTES_URL, {}, format="json")
        note_id = response.json()["id"]

        note = Note.objects.get(pk=note_id)
        self.assertEqual(note.owner, self.user)

    def test_create_note_with_category(self):
        """POST /api/v1/notes/ with a valid category_id assigns the category."""
        category = _make_category(self.user)
        response = self.client.post(NOTES_URL, {"category": str(category.pk)}, format="json")

        self.assertEqual(response.status_code, 201)
        data = response.json()
        # category in response may be an id or object; just verify the note has it in DB
        note_id = data["id"]
        note = Note.objects.get(pk=note_id)
        self.assertEqual(note.category, category)


# ---------------------------------------------------------------------------
# GET /api/v1/notes/ — list notes
# ---------------------------------------------------------------------------

class ListNotesEndpointTest(TestCase):
    """API contract tests for GET /api/v1/notes/."""

    def setUp(self):
        self.client, self.user = _authenticated_client(email="list@example.com")

    def test_list_returns_200(self):
        """GET /api/v1/notes/ returns HTTP 200 OK."""
        response = self.client.get(NOTES_URL)

        self.assertEqual(response.status_code, 200)

    def test_list_response_is_a_list(self):
        """The list response body is a JSON array."""
        response = self.client.get(NOTES_URL)

        self.assertIsInstance(response.json(), list)

    def test_list_is_empty_when_user_has_no_notes(self):
        """A user with no notes receives an empty list."""
        response = self.client.get(NOTES_URL)

        self.assertEqual(response.json(), [])

    def test_list_returns_all_user_notes(self):
        """The list returns all notes for the authenticated user."""
        _make_note(self.user, title="Note 1")
        _make_note(self.user, title="Note 2")

        response = self.client.get(NOTES_URL)

        self.assertEqual(len(response.json()), 2)

    def test_each_item_has_required_fields(self):
        """Every item in the list has id, title, content, category, created_at, updated_at."""
        _make_note(self.user, title="Test")

        response = self.client.get(NOTES_URL)

        for item in response.json():
            for field in ("id", "title", "content", "category", "created_at", "updated_at"):
                self.assertIn(field, item, msg=f"Missing '{field}' in list item: {item}")

    # --- User isolation ---

    def test_list_does_not_return_other_users_notes(self):
        """GET /api/v1/notes/ returns only the authenticated user's notes."""
        _client_b, user_b = _authenticated_client(email="other_lister@example.com")
        _make_note(user_b, title="B's note")

        response = self.client.get(NOTES_URL)
        titles = [item["title"] for item in response.json()]

        self.assertNotIn("B's note", titles)

    # --- Ordering ---

    def test_list_is_ordered_most_recent_first(self):
        """GET /api/v1/notes/ returns notes ordered by updated_at descending."""
        first = _make_note(self.user, title="First")
        time.sleep(0.01)
        second = _make_note(self.user, title="Second")
        time.sleep(0.01)
        third = _make_note(self.user, title="Third")

        response = self.client.get(NOTES_URL)
        ids = [item["id"] for item in response.json()]

        self.assertEqual(ids[0], str(third.pk))
        self.assertEqual(ids[1], str(second.pk))
        self.assertEqual(ids[2], str(first.pk))

    # --- Category filter ---

    def test_category_filter_returns_only_matching_notes(self):
        """GET /api/v1/notes/?category={id} filters notes by category."""
        cat_a = _make_category(self.user, title="Cat A", color="#111111")
        cat_b = _make_category(self.user, title="Cat B", color="#222222")
        note_in_a = _make_note(self.user, title="In A", category=cat_a)
        _make_note(self.user, title="In B", category=cat_b)

        response = self.client.get(NOTES_URL, {"category": str(cat_a.pk)})

        self.assertEqual(response.status_code, 200)
        ids = [item["id"] for item in response.json()]
        self.assertIn(str(note_in_a.pk), ids)
        self.assertEqual(len(ids), 1)

    def test_category_filter_excludes_uncategorized_notes(self):
        """Category filter does not include notes with category=None."""
        cat = _make_category(self.user)
        _make_note(self.user, title="In cat", category=cat)
        _make_note(self.user, title="No cat", category=None)

        response = self.client.get(NOTES_URL, {"category": str(cat.pk)})

        self.assertEqual(len(response.json()), 1)

    def test_no_category_filter_returns_all_notes(self):
        """Without a category filter, all notes are returned."""
        cat = _make_category(self.user)
        _make_note(self.user, title="In cat", category=cat)
        _make_note(self.user, title="No cat", category=None)

        response = self.client.get(NOTES_URL)

        self.assertEqual(len(response.json()), 2)

    def test_category_filter_ignores_other_users_notes(self):
        """Category filter still only returns the current user's notes."""
        _client_b, user_b = _authenticated_client(email="filter_other@example.com")
        cat = _make_category(self.user)
        _make_note(user_b, title="B's note in A's cat", category=cat)

        response = self.client.get(NOTES_URL, {"category": str(cat.pk)})

        self.assertEqual(len(response.json()), 0)


# ---------------------------------------------------------------------------
# GET /api/v1/notes/{id}/ — retrieve note
# ---------------------------------------------------------------------------

class RetrieveNoteEndpointTest(TestCase):
    """API contract tests for GET /api/v1/notes/{id}/."""

    def setUp(self):
        self.client, self.user = _authenticated_client(email="retrieve@example.com")
        self.note = _make_note(self.user, title="Retrievable", content="Some content")

    def test_retrieve_returns_200(self):
        """GET /api/v1/notes/{id}/ returns HTTP 200 OK."""
        response = self.client.get(_note_detail_url(self.note.pk))

        self.assertEqual(response.status_code, 200)

    def test_retrieve_response_has_correct_id(self):
        """The retrieve response includes the requested note's id."""
        response = self.client.get(_note_detail_url(self.note.pk))

        self.assertEqual(response.json()["id"], str(self.note.pk))

    def test_retrieve_response_has_all_fields(self):
        """The retrieve response includes id, title, content, category, created_at, updated_at."""
        response = self.client.get(_note_detail_url(self.note.pk))

        for field in ("id", "title", "content", "category", "created_at", "updated_at"):
            self.assertIn(field, response.json(), msg=f"Missing '{field}' in retrieve response")

    def test_retrieve_returns_correct_title(self):
        """The retrieve response contains the note's title."""
        response = self.client.get(_note_detail_url(self.note.pk))

        self.assertEqual(response.json()["title"], "Retrievable")

    def test_retrieve_returns_404_for_nonexistent_note(self):
        """GET /api/v1/notes/{unknown_id}/ returns 404."""
        response = self.client.get(_note_detail_url(uuid.uuid4()))

        self.assertEqual(response.status_code, 404)

    def test_retrieve_returns_404_for_another_users_note(self):
        """GET /api/v1/notes/{id}/ returns 404 when the note belongs to another user."""
        _client_b, user_b = _authenticated_client(email="retrieve_other@example.com")
        other_note = _make_note(user_b, title="Not yours")

        response = self.client.get(_note_detail_url(other_note.pk))

        self.assertEqual(response.status_code, 404)

    def test_retrieve_note_includes_category_when_set(self):
        """The retrieve response includes the category reference when one is assigned."""
        category = _make_category(self.user)
        note = _make_note(self.user, title="With cat", category=category)

        response = self.client.get(_note_detail_url(note.pk))

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("category", data)
        self.assertIsNotNone(data["category"])


# ---------------------------------------------------------------------------
# PATCH /api/v1/notes/{id}/ — partial update
# ---------------------------------------------------------------------------

class UpdateNoteEndpointTest(TestCase):
    """API contract tests for PATCH /api/v1/notes/{id}/."""

    def setUp(self):
        self.client, self.user = _authenticated_client(email="patch@example.com")
        self.note = _make_note(self.user, title="Original", content="Old content")

    def _patch(self, payload, note_id=None):
        if note_id is None:
            note_id = self.note.pk
        return self.client.patch(_note_detail_url(note_id), payload, format="json")

    def test_patch_returns_200(self):
        """PATCH /api/v1/notes/{id}/ returns HTTP 200 OK."""
        response = self._patch({"title": "Updated"})

        self.assertEqual(response.status_code, 200)

    def test_patch_response_contains_updated_title(self):
        """The PATCH response reflects the updated title."""
        response = self._patch({"title": "New Title"})

        self.assertEqual(response.json()["title"], "New Title")

    def test_patch_title_only_leaves_content_unchanged(self):
        """PATCHing only title does not change content."""
        response = self._patch({"title": "Changed Title"})

        self.assertEqual(response.json()["content"], "Old content")

    def test_patch_content_only_leaves_title_unchanged(self):
        """PATCHing only content does not change title."""
        response = self._patch({"content": "New content"})

        self.assertEqual(response.json()["title"], "Original")

    def test_patch_category_only(self):
        """PATCHing only category assigns the category without touching other fields."""
        category = _make_category(self.user)

        response = self._patch({"category": str(category.pk)})

        self.assertEqual(response.status_code, 200)
        note = Note.objects.get(pk=self.note.pk)
        self.assertEqual(note.category, category)
        self.assertEqual(note.title, "Original")

    def test_patch_title_and_content_together(self):
        """PATCHing title and content together updates both."""
        response = self._patch({"title": "New Title", "content": "New content"})

        data = response.json()
        self.assertEqual(data["title"], "New Title")
        self.assertEqual(data["content"], "New content")

    def test_patch_updates_updated_at(self):
        """PATCH causes updated_at to advance."""
        original = self.note.updated_at

        response = self._patch({"title": "Changed"})

        from django.utils.dateparse import parse_datetime
        new_updated_at = parse_datetime(response.json()["updated_at"])
        self.assertGreaterEqual(new_updated_at, original)

    def test_patch_persists_to_database(self):
        """PATCH persists changes; re-fetching from DB shows the updated values."""
        self._patch({"title": "DB Persisted"})

        note = Note.objects.get(pk=self.note.pk)
        self.assertEqual(note.title, "DB Persisted")

    def test_patch_returns_404_for_nonexistent_note(self):
        """PATCH /api/v1/notes/{unknown_id}/ returns 404."""
        response = self._patch({"title": "x"}, note_id=uuid.uuid4())

        self.assertEqual(response.status_code, 404)

    def test_patch_returns_403_or_404_for_another_users_note(self):
        """PATCH on another user's note returns 403 or 404 (not 200)."""
        _client_b, user_b = _authenticated_client(email="patch_other@example.com")
        other_note = _make_note(user_b, title="B's note")

        response = self._patch({"title": "Hacked"}, note_id=other_note.pk)

        self.assertIn(response.status_code, [403, 404])

    def test_patch_with_empty_body_returns_200(self):
        """PATCH with an empty body is valid (no-op partial update) and returns 200."""
        response = self._patch({})

        self.assertEqual(response.status_code, 200)

    def test_patch_response_has_all_fields(self):
        """PATCH response includes id, title, content, category, created_at, updated_at."""
        response = self._patch({"title": "Fields check"})

        for field in ("id", "title", "content", "category", "created_at", "updated_at"):
            self.assertIn(field, response.json(), msg=f"Missing '{field}' in PATCH response")

    def test_patch_category_to_none_clears_category(self):
        """PATCHing category=null clears the category on the note."""
        category = _make_category(self.user)
        note = _make_note(self.user, title="Has cat", category=category)

        response = self.client.patch(
            _note_detail_url(note.pk),
            {"category": None},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        note.refresh_from_db()
        self.assertIsNone(note.category)


# ---------------------------------------------------------------------------
# DELETE /api/v1/notes/{id}/ — delete note
# ---------------------------------------------------------------------------

class DeleteNoteEndpointTest(TestCase):
    """API contract tests for DELETE /api/v1/notes/{id}/."""

    def setUp(self):
        self.client, self.user = _authenticated_client(email="delete@example.com")
        self.note = _make_note(self.user, title="To be deleted")

    def test_delete_returns_204(self):
        """DELETE /api/v1/notes/{id}/ returns HTTP 204 No Content."""
        response = self.client.delete(_note_detail_url(self.note.pk))

        self.assertEqual(response.status_code, 204)

    def test_delete_removes_note_from_database(self):
        """After DELETE, the note no longer exists in the database."""
        note_id = self.note.pk
        self.client.delete(_note_detail_url(note_id))

        self.assertFalse(Note.objects.filter(pk=note_id).exists())

    def test_delete_returns_404_for_nonexistent_note(self):
        """DELETE /api/v1/notes/{unknown_id}/ returns 404."""
        response = self.client.delete(_note_detail_url(uuid.uuid4()))

        self.assertEqual(response.status_code, 404)

    def test_delete_returns_403_or_404_for_another_users_note(self):
        """DELETE on another user's note returns 403 or 404."""
        _client_b, user_b = _authenticated_client(email="delete_other@example.com")
        other_note = _make_note(user_b, title="Not yours")

        response = self.client.delete(_note_detail_url(other_note.pk))

        self.assertIn(response.status_code, [403, 404])

    def test_delete_does_not_delete_other_notes(self):
        """DELETE only removes the targeted note; other notes remain."""
        other_note = _make_note(self.user, title="Keep me")

        self.client.delete(_note_detail_url(self.note.pk))

        self.assertTrue(Note.objects.filter(pk=other_note.pk).exists())

    def test_retrieving_deleted_note_returns_404(self):
        """After deletion, GET /api/v1/notes/{id}/ returns 404."""
        note_id = self.note.pk
        self.client.delete(_note_detail_url(note_id))

        response = self.client.get(_note_detail_url(note_id))
        self.assertEqual(response.status_code, 404)


# ---------------------------------------------------------------------------
# OpenAPI schema presence
# ---------------------------------------------------------------------------

class NotesOpenAPISchemaTest(TestCase):
    """Verify that notes endpoints are annotated in the OpenAPI schema."""

    def setUp(self):
        self.client = APIClient()

    def test_openapi_schema_includes_notes_list_path(self):
        """The generated schema contains the /api/v1/notes/ path."""
        schema = _load_openapi_schema(self.client)

        self.assertIn("/api/v1/notes/", schema.get("paths", {}))

    def test_openapi_schema_includes_notes_detail_path(self):
        """The generated schema contains the /api/v1/notes/{id}/ path."""
        schema = _load_openapi_schema(self.client)

        paths = schema.get("paths", {})
        # Path may use {id} or {pk} — check either variant
        has_detail = any(
            "notes" in p and "{" in p for p in paths
        )
        self.assertTrue(has_detail, msg=f"No notes detail path found in schema. Paths: {list(paths.keys())}")

    def test_notes_list_path_has_get_operation(self):
        """The /api/v1/notes/ path defines a GET operation."""
        schema = _load_openapi_schema(self.client)

        notes_path = schema.get("paths", {}).get("/api/v1/notes/", {})
        self.assertIn("get", notes_path)

    def test_notes_list_path_has_post_operation(self):
        """The /api/v1/notes/ path defines a POST operation."""
        schema = _load_openapi_schema(self.client)

        notes_path = schema.get("paths", {}).get("/api/v1/notes/", {})
        self.assertIn("post", notes_path)

    def test_notes_get_operation_has_notes_tag(self):
        """The GET /api/v1/notes/ operation is tagged with 'notes'."""
        schema = _load_openapi_schema(self.client)

        get_op = schema.get("paths", {}).get("/api/v1/notes/", {}).get("get", {})
        self.assertIn("notes", get_op.get("tags", []))

    def test_notes_post_operation_has_notes_tag(self):
        """The POST /api/v1/notes/ operation is tagged with 'notes'."""
        schema = _load_openapi_schema(self.client)

        post_op = schema.get("paths", {}).get("/api/v1/notes/", {}).get("post", {})
        self.assertIn("notes", post_op.get("tags", []))

    def test_notes_list_get_operation_documents_200_response(self):
        """The GET /api/v1/notes/ operation documents a 200 response."""
        schema = _load_openapi_schema(self.client)

        get_op = schema.get("paths", {}).get("/api/v1/notes/", {}).get("get", {})
        self.assertIn("200", get_op.get("responses", {}))

    def test_notes_post_operation_documents_201_response(self):
        """The POST /api/v1/notes/ operation documents a 201 response."""
        schema = _load_openapi_schema(self.client)

        post_op = schema.get("paths", {}).get("/api/v1/notes/", {}).get("post", {})
        self.assertIn("201", post_op.get("responses", {}))

    def test_notes_list_get_operation_documents_401_response(self):
        """The GET /api/v1/notes/ operation documents a 401 response."""
        schema = _load_openapi_schema(self.client)

        get_op = schema.get("paths", {}).get("/api/v1/notes/", {}).get("get", {})
        self.assertIn("401", get_op.get("responses", {}))

    def _get_detail_path_ops(self, schema):
        """Return the path object for the notes detail endpoint."""
        for path, ops in schema.get("paths", {}).items():
            if "notes" in path and "{" in path:
                return ops
        return {}

    def test_notes_detail_path_has_get_operation(self):
        """The notes detail path defines a GET operation."""
        schema = _load_openapi_schema(self.client)
        ops = self._get_detail_path_ops(schema)

        self.assertIn("get", ops)

    def test_notes_detail_path_has_patch_operation(self):
        """The notes detail path defines a PATCH operation."""
        schema = _load_openapi_schema(self.client)
        ops = self._get_detail_path_ops(schema)

        self.assertIn("patch", ops)

    def test_notes_detail_path_has_delete_operation(self):
        """The notes detail path defines a DELETE operation."""
        schema = _load_openapi_schema(self.client)
        ops = self._get_detail_path_ops(schema)

        self.assertIn("delete", ops)

    def test_notes_detail_get_has_notes_tag(self):
        """The GET operation on the notes detail path is tagged with 'notes'."""
        schema = _load_openapi_schema(self.client)
        ops = self._get_detail_path_ops(schema)

        self.assertIn("notes", ops.get("get", {}).get("tags", []))

    def test_notes_detail_patch_has_notes_tag(self):
        """The PATCH operation on the notes detail path is tagged with 'notes'."""
        schema = _load_openapi_schema(self.client)
        ops = self._get_detail_path_ops(schema)

        self.assertIn("notes", ops.get("patch", {}).get("tags", []))

    def test_notes_detail_delete_has_notes_tag(self):
        """The DELETE operation on the notes detail path is tagged with 'notes'."""
        schema = _load_openapi_schema(self.client)
        ops = self._get_detail_path_ops(schema)

        self.assertIn("notes", ops.get("delete", {}).get("tags", []))
