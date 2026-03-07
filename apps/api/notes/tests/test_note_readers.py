"""
Unit tests for note readers (task 3A).

Readers tested:
  - list_notes(owner, category_id=None) -> QuerySet[Note]
    Returns all notes owned by the user, ordered by updated_at descending.
    Optionally filters by category FK when category_id is supplied.

  - get_note(note_id, owner) -> Note
    Returns a single note by pk.
    Raises NotFoundError if the note does not exist OR does not belong to owner.
"""

from django.test import TestCase

from accounts.models import User
from notes.models import Category, Note


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_user(email="user@example.com", password="StrongPass123!"):
    return User.objects.create_user(email=email, password=password)


def _make_category(user, title="Cat", color="#AABBCC"):
    return Category.objects.create(title=title, color=color, user=user)


def _make_note(owner, title="", content="", category=None):
    return Note.objects.create(title=title, content=content, owner=owner, category=category)


# ---------------------------------------------------------------------------
# list_notes reader
# ---------------------------------------------------------------------------

class ListNotesReaderTest(TestCase):
    """Unit tests for the list_notes reader."""

    def _call(self, owner, **kwargs):
        from notes.readers.list_notes import list_notes

        return list_notes(owner=owner, **kwargs)

    def test_returns_empty_queryset_when_user_has_no_notes(self):
        """list_notes returns an empty result when the user has no notes."""
        user = _make_user(email="empty@example.com")

        result = self._call(owner=user)

        self.assertEqual(result.count(), 0)

    def test_returns_all_notes_for_the_user(self):
        """list_notes returns every note that belongs to the owner."""
        user = _make_user(email="allnotes@example.com")
        _make_note(user, title="Note 1")
        _make_note(user, title="Note 2")
        _make_note(user, title="Note 3")

        result = self._call(owner=user)

        self.assertEqual(result.count(), 3)

    def test_does_not_return_notes_owned_by_other_users(self):
        """list_notes excludes notes belonging to other users."""
        user_a = _make_user(email="usera@example.com")
        user_b = _make_user(email="userb@example.com")
        _make_note(user_b, title="B's note")

        result = self._call(owner=user_a)

        self.assertEqual(result.count(), 0)

    def test_result_is_a_queryset(self):
        """list_notes returns a Django QuerySet."""
        from django.db.models import QuerySet

        user = _make_user(email="qs@example.com")

        result = self._call(owner=user)

        self.assertIsInstance(result, QuerySet)

    # --- Ordering ---

    def test_notes_are_ordered_by_updated_at_descending(self):
        """list_notes returns notes with the most recently updated first."""
        import time

        user = _make_user(email="ordering@example.com")
        first = _make_note(user, title="First")
        time.sleep(0.01)
        second = _make_note(user, title="Second")
        time.sleep(0.01)
        third = _make_note(user, title="Third")

        result = list(self._call(owner=user))

        self.assertEqual(result[0].pk, third.pk)
        self.assertEqual(result[1].pk, second.pk)
        self.assertEqual(result[2].pk, first.pk)

    def test_updating_a_note_moves_it_to_the_front(self):
        """After updating an older note, it moves to the top of the list."""
        import time

        user = _make_user(email="reorder@example.com")
        first = _make_note(user, title="First")
        time.sleep(0.01)
        _second = _make_note(user, title="Second")

        # Update the first note so it has the latest updated_at
        first.title = "First (updated)"
        first.save()

        result = list(self._call(owner=user))

        self.assertEqual(result[0].pk, first.pk)

    # --- Category filter ---

    def test_filter_by_category_returns_only_matching_notes(self):
        """list_notes with category_id filters notes to that category only."""
        user = _make_user(email="catfilter@example.com")
        cat_a = _make_category(user, title="Cat A", color="#111111")
        cat_b = _make_category(user, title="Cat B", color="#222222")
        note_a = _make_note(user, title="In A", category=cat_a)
        _make_note(user, title="In B", category=cat_b)

        result = self._call(owner=user, category_id=cat_a.pk)

        self.assertEqual(result.count(), 1)
        self.assertEqual(result.first().pk, note_a.pk)

    def test_filter_by_category_excludes_uncategorized_notes(self):
        """list_notes with category_id excludes notes with no category."""
        user = _make_user(email="exclude_none@example.com")
        cat = _make_category(user)
        _make_note(user, title="In category", category=cat)
        _make_note(user, title="No category", category=None)

        result = self._call(owner=user, category_id=cat.pk)

        self.assertEqual(result.count(), 1)

    def test_filter_by_nonexistent_category_returns_empty(self):
        """list_notes with a category_id that has no notes returns empty."""
        import uuid

        user = _make_user(email="nocat@example.com")
        _make_note(user, title="Some note")

        result = self._call(owner=user, category_id=uuid.uuid4())

        self.assertEqual(result.count(), 0)

    def test_no_category_filter_returns_all_notes(self):
        """list_notes without category_id returns notes regardless of their category."""
        user = _make_user(email="nofilter@example.com")
        cat = _make_category(user)
        _make_note(user, title="Categorized", category=cat)
        _make_note(user, title="Uncategorized", category=None)

        result = self._call(owner=user)

        self.assertEqual(result.count(), 2)

    def test_category_filter_does_not_leak_other_users_notes(self):
        """list_notes with category_id still excludes notes from other users."""
        user_a = _make_user(email="owner_a@example.com")
        user_b = _make_user(email="owner_b@example.com")
        cat = _make_category(user_a, title="Shared-name cat", color="#ABCDEF")
        _make_note(user_b, title="B's note", category=cat)

        result = self._call(owner=user_a, category_id=cat.pk)

        self.assertEqual(result.count(), 0)


# ---------------------------------------------------------------------------
# get_note reader
# ---------------------------------------------------------------------------

class GetNoteReaderTest(TestCase):
    """Unit tests for the get_note reader."""

    def setUp(self):
        self.user = _make_user(email="getter@example.com")
        self.note = _make_note(self.user, title="Readable note", content="Content")

    def _call(self, note_id=None, owner=None):
        from notes.readers.get_note import get_note

        if note_id is None:
            note_id = self.note.pk
        if owner is None:
            owner = self.user
        return get_note(note_id=note_id, owner=owner)

    def test_returns_note_instance(self):
        """get_note returns the matching Note instance."""
        result = self._call()

        self.assertIsInstance(result, Note)

    def test_returns_correct_note(self):
        """get_note returns the note matching the given note_id."""
        result = self._call()

        self.assertEqual(result.pk, self.note.pk)

    def test_raises_not_found_for_nonexistent_note(self):
        """get_note raises NotFoundError when the note_id does not exist."""
        import uuid
        from notes.exceptions import NotFoundError

        with self.assertRaises(NotFoundError):
            self._call(note_id=uuid.uuid4())

    def test_raises_not_found_for_another_users_note(self):
        """get_note raises NotFoundError when the note belongs to another user."""
        from notes.exceptions import NotFoundError

        other_user = _make_user(email="other_getter@example.com")
        other_note = _make_note(other_user, title="Theirs")

        with self.assertRaises(NotFoundError):
            self._call(note_id=other_note.pk, owner=self.user)

    def test_note_fields_are_populated(self):
        """The returned note exposes title, content, owner, and timestamps."""
        result = self._call()

        self.assertEqual(result.title, "Readable note")
        self.assertEqual(result.content, "Content")
        self.assertEqual(result.owner, self.user)
        self.assertIsNotNone(result.created_at)
        self.assertIsNotNone(result.updated_at)

    def test_note_with_category_returns_category(self):
        """get_note returns a note with its category populated."""
        category = _make_category(self.user)
        note = _make_note(self.user, title="With cat", category=category)

        from notes.readers.get_note import get_note

        result = get_note(note_id=note.pk, owner=self.user)

        self.assertEqual(result.category, category)
