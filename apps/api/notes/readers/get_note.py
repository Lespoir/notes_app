"""
Reader: retrieve a single note by ID for a given user.
"""
from lib.errors import NotFoundError
from notes.models import Note


def get_note(*, note_id, owner) -> Note:
    """
    Return the note with the given id if it is owned by owner.

    Raises NotFoundError if no such note exists for this user.
    """
    try:
        return (
            Note.objects.select_related("category")
            .get(id=note_id, owner=owner)
        )
    except Note.DoesNotExist:
        raise NotFoundError("Note not found.")
