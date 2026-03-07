"""
Action: create a new note for a user.

Creates a note with empty title and content, optionally assigned to a category.
"""
from notes.models import Note


def create_note(*, owner, category) -> Note:
    """
    Create a new note owned by the given user.

    - title and content default to empty strings.
    - category is required; pass a Category instance to assign it.

    Returns the newly created Note instance.
    """
    note = Note.objects.create(
        owner=owner,
        title="",
        content="",
        category=category,
    )
    return note
