"""
Action: seed default categories for a newly registered user.

Creates 3 default categories (Random Thoughts, School, Personal) for the given user.
This is called once during user registration and should not be called again for the
same user.
"""
from notes.models import Category

DEFAULT_CATEGORIES = [
    {"title": "Random Thoughts", "color": "#F5A623"},
    {"title": "School", "color": "#4A90E2"},
    {"title": "Personal", "color": "#7ED321"},
]


def seed_default_categories(*, user) -> list[Category]:
    """
    Create the 3 default categories for the given user and return them.

    This is an idempotent-safe operation in the context of new user registration
    (called once per user at sign-up time).
    """
    categories = [
        Category(title=item["title"], color=item["color"], user=user)
        for item in DEFAULT_CATEGORIES
    ]
    Category.objects.bulk_create(categories)
    return categories
