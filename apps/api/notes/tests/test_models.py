from django.test import TestCase
from django.utils import timezone


class NoteModelTest(TestCase):
    """Tests for the Note model stub delivered by task 0A."""

    def setUp(self):
        from accounts.models import User

        self.user = User.objects.create_user(
            email="testuser@example.com",
            password="testpass123",
        )

    def test_note_can_be_created_with_title_and_content(self):
        """Note can be created with a title and content."""
        from notes.models import Note

        note = Note.objects.create(
            title="My first note",
            content="Some content here",
            owner=self.user,
        )

        self.assertEqual(note.title, "My first note")
        self.assertEqual(note.content, "Some content here")

    def test_note_has_created_at_timestamp(self):
        """Note records a created_at timestamp on creation."""
        from notes.models import Note

        before = timezone.now()
        note = Note.objects.create(title="Timestamp test", content="", owner=self.user)
        after = timezone.now()

        self.assertIsNotNone(note.created_at)
        self.assertGreaterEqual(note.created_at, before)
        self.assertLessEqual(note.created_at, after)

    def test_note_has_updated_at_timestamp(self):
        """Note records an updated_at timestamp that changes on save."""
        from notes.models import Note

        note = Note.objects.create(title="Update test", content="initial", owner=self.user)
        original_updated_at = note.updated_at

        note.content = "modified"
        note.save()

        self.assertGreaterEqual(note.updated_at, original_updated_at)

    def test_note_title_can_be_blank(self):
        """Note title can be blank to support empty note creation."""
        from notes.models import Note

        note = Note.objects.create(title="", content="", owner=self.user)

        self.assertEqual(note.title, "")

    def test_note_content_can_be_blank(self):
        """Note content can be blank."""
        from notes.models import Note

        note = Note.objects.create(title="No content yet", content="", owner=self.user)

        self.assertEqual(note.content, "")


class CategoryModelTest(TestCase):
    """Tests for the Category model delivered by task 2A."""

    def setUp(self):
        from accounts.models import User

        self.user = User.objects.create_user(
            email="catuser@example.com",
            password="testpass123",
        )

    def test_category_can_be_created_with_title_and_color(self):
        """Category can be created with a title, color, and owner."""
        from notes.models import Category

        category = Category.objects.create(
            title="Personal",
            color="#FF5733",
            user=self.user,
        )

        self.assertEqual(category.title, "Personal")
        self.assertEqual(category.color, "#FF5733")

    def test_category_title_is_required(self):
        """Category must have a title."""
        from notes.models import Category

        category = Category(title="School", color="#3498DB", user=self.user)

        self.assertEqual(category.title, "School")

    def test_category_color_is_stored(self):
        """Category stores the color value as provided."""
        from notes.models import Category

        category = Category.objects.create(title="Work", color="#2ECC71", user=self.user)

        # Re-fetch from DB to confirm persistence
        fetched = Category.objects.get(pk=category.pk)
        self.assertEqual(fetched.color, "#2ECC71")

    def test_multiple_categories_can_be_created(self):
        """Multiple distinct categories can coexist."""
        from notes.models import Category

        Category.objects.create(title="Random Thoughts", color="#AAB7B8", user=self.user)
        Category.objects.create(title="School", color="#1ABC9C", user=self.user)
        Category.objects.create(title="Personal", color="#E74C3C", user=self.user)

        self.assertEqual(Category.objects.filter(user=self.user).count(), 3)
