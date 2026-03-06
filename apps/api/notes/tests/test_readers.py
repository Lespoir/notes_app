"""
Unit tests for notes category readers (task 2A).

Readers tested:
  - list_categories(user) -> QuerySet[Category] annotated with note_count
    Returns all categories owned by the user, each annotated with the
    number of notes that belong to that category.
"""

from django.test import TestCase

from accounts.models import User
from notes.models import Category, Note


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_user(email="user@example.com", password="StrongPass123!"):
    return User.objects.create_user(email=email, password=password)


def _make_category(user, title="Test Category", color="#AABBCC"):
    return Category.objects.create(title=title, color=color, user=user)


def _make_note(user, category=None, title="A note"):
    return Note.objects.create(title=title, content="", owner=user, category=category)


# ---------------------------------------------------------------------------
# list_categories reader
# ---------------------------------------------------------------------------

class ListCategoriesReaderTest(TestCase):
    """Unit tests for the list_categories reader."""

    def _call(self, user):
        from notes.readers.list_categories import list_categories_for_user

        return list_categories_for_user(user=user)

    def test_returns_empty_queryset_when_user_has_no_categories(self):
        """list_categories returns an empty result when the user has no categories."""
        user = _make_user(email="empty@example.com")

        result = self._call(user=user)

        self.assertEqual(result.count(), 0)

    def test_returns_all_categories_for_the_user(self):
        """list_categories returns every category that belongs to the user."""
        user = _make_user(email="allcats@example.com")
        _make_category(user, title="Random Thoughts", color="#AAB7B8")
        _make_category(user, title="School", color="#1ABC9C")
        _make_category(user, title="Personal", color="#E74C3C")

        result = self._call(user=user)

        self.assertEqual(result.count(), 3)

    def test_does_not_return_categories_owned_by_other_users(self):
        """list_categories excludes categories that belong to other users."""
        user_a = _make_user(email="usera@example.com")
        user_b = _make_user(email="userb@example.com")
        _make_category(user_b, title="User B's Category", color="#123456")

        result = self._call(user=user_a)

        self.assertEqual(result.count(), 0)

    def test_each_result_has_note_count_attribute(self):
        """Every category in the result has a note_count attribute."""
        user = _make_user(email="notecount_attr@example.com")
        _make_category(user, title="Work", color="#FF5733")

        result = self._call(user=user)

        for category in result:
            self.assertTrue(
                hasattr(category, "note_count"),
                msg="Category result object is missing the 'note_count' annotation.",
            )

    def test_note_count_is_zero_for_category_with_no_notes(self):
        """A category with no notes is annotated with note_count=0."""
        user = _make_user(email="zero_notes@example.com")
        _make_category(user, title="Empty Category", color="#CCCCCC")

        result = self._call(user=user)
        category = result.get(title="Empty Category")

        self.assertEqual(category.note_count, 0)

    def test_note_count_reflects_notes_in_category(self):
        """note_count equals the number of notes assigned to that category."""
        user = _make_user(email="with_notes@example.com")
        cat = _make_category(user, title="School", color="#1ABC9C")
        _make_note(user, category=cat, title="Note 1")
        _make_note(user, category=cat, title="Note 2")
        _make_note(user, category=cat, title="Note 3")

        result = self._call(user=user)
        category = result.get(title="School")

        self.assertEqual(category.note_count, 3)

    def test_note_count_only_counts_notes_in_that_category(self):
        """note_count for a category does not include notes from other categories."""
        user = _make_user(email="isolated@example.com")
        cat_a = _make_category(user, title="Cat A", color="#111111")
        cat_b = _make_category(user, title="Cat B", color="#222222")
        _make_note(user, category=cat_a, title="Note in A")
        _make_note(user, category=cat_b, title="Note in B")
        _make_note(user, category=cat_b, title="Another in B")

        result = self._call(user=user)
        fetched_a = result.get(title="Cat A")
        fetched_b = result.get(title="Cat B")

        self.assertEqual(fetched_a.note_count, 1)
        self.assertEqual(fetched_b.note_count, 2)

    def test_note_count_does_not_count_notes_without_a_category(self):
        """Uncategorized notes (category=None) are not counted in any category."""
        user = _make_user(email="uncategorized@example.com")
        cat = _make_category(user, title="Personal", color="#E74C3C")
        _make_note(user, category=None, title="Floating note")

        result = self._call(user=user)
        category = result.get(title="Personal")

        self.assertEqual(category.note_count, 0)

    def test_note_count_does_not_count_notes_owned_by_other_users(self):
        """Notes belonging to other users are not counted in this user's categories.

        When user_b writes a note assigned to user_a's category, that note
        must not appear in user_a's note_count annotation.
        """
        user_a = _make_user(email="owner_a@example.com")
        user_b = _make_user(email="owner_b@example.com")

        cat = _make_category(user_a, title="Shared Title", color="#ABCDEF")

        # user_b creates a note placed in user_a's category — should not count
        # against user_a's note_count for that category.
        _make_note(user_b, category=cat, title="B's note in A's category")

        result = self._call(user=user_a)
        category = result.get(title="Shared Title")

        self.assertEqual(category.note_count, 0)

    def test_result_is_a_queryset(self):
        """list_categories returns a Django QuerySet (not a plain list)."""
        from django.db.models import QuerySet

        user = _make_user(email="qs@example.com")

        result = self._call(user=user)

        self.assertIsInstance(result, QuerySet)
