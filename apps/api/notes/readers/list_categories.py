"""
Reader: list categories for a user, annotated with note count.
"""
from django.db.models import Count, Q, QuerySet

from notes.models import Category


def list_categories_for_user(*, user) -> QuerySet:
    """
    Return all categories belonging to the given user, each annotated with
    the count of notes owned by that user and assigned to each category
    (note_count).

    Only notes owned by the requesting user are counted — notes from other
    users that happen to reference the same category are excluded.

    The queryset is ordered alphabetically by title (inherits from model Meta).
    """
    return (
        Category.objects.filter(user=user)
        .annotate(
            note_count=Count(
                "notes",
                filter=Q(notes__owner=user) & ~Q(notes__title="", notes__content=""),
            )
        )
    )
