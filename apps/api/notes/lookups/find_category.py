"""
Lookup: find a category by ID that belongs to a given user.

Used by note actions to validate that the referenced category
is accessible to the requesting user before assigning it.
"""
from lib.errors import NotFoundError
from notes.models import Category


def find_category_for_user(*, category_id, user) -> Category:
    """
    Return the Category with the given id belonging to user.

    Raises NotFoundError if no such category exists for this user.
    """
    try:
        return Category.objects.only("id", "title", "color", "user_id").get(
            id=category_id, user=user
        )
    except Category.DoesNotExist:
        raise NotFoundError("Category not found.")
