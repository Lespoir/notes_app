"""
Unit tests for note actions (task 3A).

These tests cover the business layer only — no HTTP/DRF concepts.

Actions tested:
  - create_note(owner) -> Note
    Creates a note with empty title and content, owned by the user.
    Category is optional (defaults to None).

  - update_note(note_id, owner, **fields) -> Note
    Partially updates a note's title, content, and/or category.
    Raises NotFoundError if the note does not exist.
    Raises PermissionDeniedError if the requesting user does not own the note.

  - delete_note(note_id, owner) -> None
    Deletes the note permanently.
    Raises NotFoundError if the note does not exist.
    Raises PermissionDeniedError if the requesting user does not own the note.
"""

from django.test import TestCase

from accounts.models import User
from notes.models import Category, Note


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_user(email="user@example.com", password="StrongPass123!"):
    return User.objects.create_user(email=email, password=password)


def _make_category(user, title="Work", color="#AABBCC"):
    return Category.objects.create(title=title, color=color, user=user)


def _make_note(owner, title="", content="", category=None):
    return Note.objects.create(title=title, content=content, owner=owner, category=category)


# ---------------------------------------------------------------------------
# create_note action
# ---------------------------------------------------------------------------

class CreateNoteActionTest(TestCase):
    """Unit tests for the create_note action."""

    def _call(self, owner=None, **kwargs):
        from notes.actions.create_note import create_note

        if owner is None:
            owner = _make_user()
        return create_note(owner=owner, **kwargs)

    def test_returns_note_instance(self):
        """create_note returns a Note model instance."""
        result = self._call()

        self.assertIsInstance(result, Note)

    def test_note_is_persisted_to_database(self):
        """create_note saves the note to the database."""
        user = _make_user(email="persist@example.com")
        note = self._call(owner=user)

        self.assertTrue(Note.objects.filter(pk=note.pk).exists())

    def test_note_title_defaults_to_empty_string(self):
        """A note created without a title has an empty title."""
        note = self._call()

        self.assertEqual(note.title, "")

    def test_note_content_defaults_to_empty_string(self):
        """A note created without content has empty content."""
        note = self._call()

        self.assertEqual(note.content, "")

    def test_note_category_defaults_to_none(self):
        """A note created without a category has category=None."""
        note = self._call()

        self.assertIsNone(note.category)

    def test_note_owner_is_the_given_user(self):
        """The created note is owned by the user passed to the action."""
        user = _make_user(email="owner@example.com")
        note = self._call(owner=user)

        self.assertEqual(note.owner, user)

    def test_note_has_created_at_timestamp(self):
        """The created note has a non-null created_at timestamp."""
        note = self._call()

        self.assertIsNotNone(note.created_at)

    def test_note_has_updated_at_timestamp(self):
        """The created note has a non-null updated_at timestamp."""
        note = self._call()

        self.assertIsNotNone(note.updated_at)

    def test_note_id_is_assigned(self):
        """The created note has a non-null primary key."""
        note = self._call()

        self.assertIsNotNone(note.pk)

    def test_create_note_with_category(self):
        """create_note accepts an optional category and assigns it."""
        user = _make_user(email="withcat@example.com")
        category = _make_category(user)
        note = self._call(owner=user, category=category)

        self.assertEqual(note.category, category)

    def test_each_call_creates_a_distinct_note(self):
        """Calling create_note twice creates two separate notes."""
        user = _make_user(email="twice@example.com")
        note_a = self._call(owner=user)
        note_b = self._call(owner=user)

        self.assertNotEqual(note_a.pk, note_b.pk)
        self.assertEqual(Note.objects.filter(owner=user).count(), 2)


# ---------------------------------------------------------------------------
# update_note action
# ---------------------------------------------------------------------------

class UpdateNoteActionTest(TestCase):
    """Unit tests for the update_note action."""

    def setUp(self):
        self.user = _make_user(email="updater@example.com")
        self.note = _make_note(owner=self.user, title="Original", content="Old content")

    def _call(self, note_id=None, owner=None, **fields):
        from notes.actions.update_note import update_note

        if note_id is None:
            note_id = self.note.pk
        if owner is None:
            owner = self.user
        return update_note(note_id=note_id, owner=owner, **fields)

    def test_returns_updated_note_instance(self):
        """update_note returns the updated Note instance."""
        result = self._call(title="New Title")

        self.assertIsInstance(result, Note)

    def test_update_title_only(self):
        """update_note with only title updates the title and leaves content unchanged."""
        result = self._call(title="Updated Title")

        self.assertEqual(result.title, "Updated Title")
        self.assertEqual(result.content, "Old content")

    def test_update_content_only(self):
        """update_note with only content updates the content and leaves title unchanged."""
        result = self._call(content="New content")

        self.assertEqual(result.title, "Original")
        self.assertEqual(result.content, "New content")

    def test_update_category_only(self):
        """update_note with only category assigns the category without changing title/content."""
        category = _make_category(self.user)
        result = self._call(category=category)

        self.assertEqual(result.category, category)
        self.assertEqual(result.title, "Original")
        self.assertEqual(result.content, "Old content")

    def test_update_title_and_content_together(self):
        """update_note with both title and content updates both fields."""
        result = self._call(title="New Title", content="New content")

        self.assertEqual(result.title, "New Title")
        self.assertEqual(result.content, "New content")

    def test_update_category_to_none(self):
        """update_note can clear the category by passing category=None."""
        category = _make_category(self.user)
        note = _make_note(owner=self.user, category=category)

        from notes.actions.update_note import update_note

        result = update_note(note_id=note.pk, owner=self.user, category=None)

        self.assertIsNone(result.category)

    def test_changes_are_persisted_to_database(self):
        """update_note persists changes so re-fetching from DB shows updated values."""
        self._call(title="Persisted Title")

        refreshed = Note.objects.get(pk=self.note.pk)
        self.assertEqual(refreshed.title, "Persisted Title")

    def test_updated_at_changes_after_update(self):
        """update_note causes the updated_at timestamp to advance."""
        original_updated_at = self.note.updated_at

        result = self._call(title="Changed")

        self.assertGreaterEqual(result.updated_at, original_updated_at)

    def test_raises_not_found_for_nonexistent_note(self):
        """update_note raises NotFoundError when the note_id does not exist."""
        import uuid
        from notes.exceptions import NotFoundError

        with self.assertRaises(NotFoundError):
            self._call(note_id=uuid.uuid4(), title="Whatever")

    def test_raises_permission_denied_for_another_users_note(self):
        """update_note raises PermissionDeniedError when owner does not own the note."""
        from notes.exceptions import PermissionDeniedError

        other_user = _make_user(email="intruder@example.com")
        other_note = _make_note(owner=other_user, title="Private note")

        with self.assertRaises(PermissionDeniedError):
            from notes.actions.update_note import update_note

            update_note(note_id=other_note.pk, owner=self.user, title="Hacked")

    def test_does_not_affect_other_notes(self):
        """update_note only modifies the targeted note, not other notes."""
        other_note = _make_note(owner=self.user, title="Untouched")

        self._call(title="Changed")

        refreshed_other = Note.objects.get(pk=other_note.pk)
        self.assertEqual(refreshed_other.title, "Untouched")


# ---------------------------------------------------------------------------
# delete_note action
# ---------------------------------------------------------------------------

class DeleteNoteActionTest(TestCase):
    """Unit tests for the delete_note action."""

    def setUp(self):
        self.user = _make_user(email="deleter@example.com")
        self.note = _make_note(owner=self.user, title="To be deleted")

    def _call(self, note_id=None, owner=None):
        from notes.actions.delete_note import delete_note

        if note_id is None:
            note_id = self.note.pk
        if owner is None:
            owner = self.user
        return delete_note(note_id=note_id, owner=owner)

    def test_note_is_removed_from_database(self):
        """delete_note removes the note from the database."""
        note_id = self.note.pk
        self._call()

        self.assertFalse(Note.objects.filter(pk=note_id).exists())

    def test_returns_none(self):
        """delete_note returns None."""
        result = self._call()

        self.assertIsNone(result)

    def test_raises_not_found_for_nonexistent_note(self):
        """delete_note raises NotFoundError when the note_id does not exist."""
        import uuid
        from notes.exceptions import NotFoundError

        with self.assertRaises(NotFoundError):
            self._call(note_id=uuid.uuid4())

    def test_raises_permission_denied_for_another_users_note(self):
        """delete_note raises PermissionDeniedError when owner does not own the note."""
        from notes.exceptions import PermissionDeniedError

        other_user = _make_user(email="intruder2@example.com")
        other_note = _make_note(owner=other_user, title="Not yours")

        with self.assertRaises(PermissionDeniedError):
            from notes.actions.delete_note import delete_note

            delete_note(note_id=other_note.pk, owner=self.user)

    def test_other_notes_are_not_deleted(self):
        """delete_note only removes the targeted note; other notes are unaffected."""
        other_note = _make_note(owner=self.user, title="Keep me")

        self._call()

        self.assertTrue(Note.objects.filter(pk=other_note.pk).exists())

    def test_deleting_note_does_not_delete_its_category(self):
        """Deleting a note does not cascade-delete its associated category."""
        category = _make_category(self.user)
        note = _make_note(owner=self.user, category=category)

        from notes.actions.delete_note import delete_note

        delete_note(note_id=note.pk, owner=self.user)

        self.assertTrue(Category.objects.filter(pk=category.pk).exists())
