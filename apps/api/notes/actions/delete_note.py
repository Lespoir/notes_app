"""
Action: delete a note.

Removes the note permanently. Only the owning user may delete their notes.
"""
from lib.errors import NotFoundError, PermissionDeniedError
from notes.models import Note


def delete_note(*, note_id, owner) -> None:
    """
    Delete the note identified by note_id if it belongs to owner.

    Raises NotFoundError if the note does not exist.
    Raises PermissionDeniedError if the owner does not own the note.
    """
    try:
        note = Note.objects.get(id=note_id)
    except Note.DoesNotExist:
        raise NotFoundError("Note not found.")

    if note.owner_id != owner.pk:
        raise PermissionDeniedError("You do not have permission to delete this note.")

    note.delete()
