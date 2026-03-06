"""
Unit tests for notes category actions (task 2A).

These tests cover the business layer only — no HTTP/DRF concepts.
Actions tested:
  - create_default_categories(user) -> list[Category]
    Creates 3 default categories (Random Thoughts, School, Personal) for a user.

Registration hook tested:
  - register_user(email, password) triggers default category creation.
"""

from django.test import TestCase

from accounts.models import User
from notes.models import Category


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_user(email="user@example.com", password="StrongPass123!"):
    return User.objects.create_user(email=email, password=password)


# ---------------------------------------------------------------------------
# create_default_categories action
# ---------------------------------------------------------------------------

class CreateDefaultCategoriesActionTest(TestCase):
    """Unit tests for the create_default_categories action."""

    def _call(self, user=None):
        from notes.actions.seed_categories import seed_default_categories

        if user is None:
            user = _make_user()
        return seed_default_categories(user=user)

    def test_returns_a_list(self):
        """create_default_categories returns a list."""
        result = self._call()

        self.assertIsInstance(result, list)

    def test_returns_three_categories(self):
        """create_default_categories creates exactly 3 categories."""
        result = self._call()

        self.assertEqual(len(result), 3)

    def test_all_returned_items_are_category_instances(self):
        """Every item in the returned list is a Category model instance."""
        result = self._call()

        for category in result:
            self.assertIsInstance(category, Category)

    def test_categories_are_persisted_to_database(self):
        """create_default_categories saves all 3 categories to the database."""
        user = _make_user(email="persist@example.com")
        self._call(user=user)

        self.assertEqual(Category.objects.filter(user=user).count(), 3)

    def test_creates_random_thoughts_category(self):
        """One of the created categories is titled 'Random Thoughts'."""
        user = _make_user(email="rthoughts@example.com")
        self._call(user=user)

        self.assertTrue(
            Category.objects.filter(user=user, title="Random Thoughts").exists()
        )

    def test_creates_school_category(self):
        """One of the created categories is titled 'School'."""
        user = _make_user(email="school@example.com")
        self._call(user=user)

        self.assertTrue(
            Category.objects.filter(user=user, title="School").exists()
        )

    def test_creates_personal_category(self):
        """One of the created categories is titled 'Personal'."""
        user = _make_user(email="personal@example.com")
        self._call(user=user)

        self.assertTrue(
            Category.objects.filter(user=user, title="Personal").exists()
        )

    def test_each_category_has_a_non_empty_color(self):
        """Every default category is assigned a non-empty color value."""
        result = self._call()

        for category in result:
            self.assertTrue(
                category.color,
                msg=f"Category '{category.title}' has an empty color.",
            )

    def test_each_category_color_is_a_hex_string(self):
        """Every default category color is a 7-character hex string (e.g. '#AABBCC')."""
        result = self._call()

        for category in result:
            self.assertRegex(
                category.color,
                r"^#[0-9A-Fa-f]{6}$",
                msg=f"Category '{category.title}' color '{category.color}' is not a valid hex color.",
            )

    def test_all_three_categories_have_distinct_colors(self):
        """The three default categories each have a unique color."""
        result = self._call()

        colors = [c.color for c in result]
        self.assertEqual(len(colors), len(set(colors)))

    def test_categories_belong_to_the_given_user(self):
        """Every created category is associated with the supplied user."""
        user = _make_user(email="owner@example.com")
        result = self._call(user=user)

        for category in result:
            self.assertEqual(category.user, user)

    def test_does_not_create_categories_for_other_users(self):
        """create_default_categories only creates categories for the given user."""
        user_a = _make_user(email="usera@example.com")
        user_b = _make_user(email="userb@example.com")

        self._call(user=user_a)

        self.assertEqual(Category.objects.filter(user=user_b).count(), 0)

    def test_calling_twice_for_same_user_creates_six_categories(self):
        """Calling the action twice is not idempotent — each call creates 3 new rows.

        (Idempotency is not required by the spec; this documents the current behavior.)
        """
        user = _make_user(email="twice@example.com")
        self._call(user=user)
        self._call(user=user)

        # Each invocation inserts 3 rows; two calls yield 6.
        self.assertEqual(Category.objects.filter(user=user).count(), 6)


# ---------------------------------------------------------------------------
# Registration hook — default categories are created on user sign-up
# ---------------------------------------------------------------------------

class RegisterUserCreatesDefaultCategoriesTest(TestCase):
    """Verify that registering a new user auto-creates the 3 default categories."""

    def _register(self, email="newuser@example.com", password="StrongPass123!"):
        from accounts.actions import register_user

        return register_user(email=email, password=password)

    def test_register_user_creates_three_categories(self):
        """After register_user completes, the new user has 3 categories."""
        user = self._register(email="hook@example.com")

        self.assertEqual(Category.objects.filter(user=user).count(), 3)

    def test_register_user_creates_random_thoughts_category(self):
        """After registration, the user has a 'Random Thoughts' category."""
        user = self._register(email="hook_rthoughts@example.com")

        self.assertTrue(
            Category.objects.filter(user=user, title="Random Thoughts").exists()
        )

    def test_register_user_creates_school_category(self):
        """After registration, the user has a 'School' category."""
        user = self._register(email="hook_school@example.com")

        self.assertTrue(
            Category.objects.filter(user=user, title="School").exists()
        )

    def test_register_user_creates_personal_category(self):
        """After registration, the user has a 'Personal' category."""
        user = self._register(email="hook_personal@example.com")

        self.assertTrue(
            Category.objects.filter(user=user, title="Personal").exists()
        )

    def test_registering_two_users_gives_each_their_own_categories(self):
        """Each registered user gets their own independent set of default categories."""
        user_a = self._register(email="user_a@example.com")
        user_b = self._register(email="user_b@example.com")

        self.assertEqual(Category.objects.filter(user=user_a).count(), 3)
        self.assertEqual(Category.objects.filter(user=user_b).count(), 3)

        # Categories are not shared between users
        a_ids = set(Category.objects.filter(user=user_a).values_list("id", flat=True))
        b_ids = set(Category.objects.filter(user=user_b).values_list("id", flat=True))
        self.assertTrue(a_ids.isdisjoint(b_ids))
