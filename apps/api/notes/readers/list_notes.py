"""
Reader: list notes for a user, ordered by most recently edited.

Supports optional filtering by category.
"""
from django.db.models import QuerySet

from notes.models import Note


def list_notes(*, owner, category_id=None) -> QuerySet:
    """
    Return all notes owned by the given user, ordered by updated_at descending
    (most recently edited first).

    If category_id is provided, only notes assigned to that category are returned.
    An unrecognised category_id simply yields an empty set.
    """
    qs = (
        Note.objects.filter(owner=owner)
        .select_related("category")
        .order_by("-updated_at")
    )

    if category_id is not None:
        qs = qs.filter(category_id=category_id)

    return qs
