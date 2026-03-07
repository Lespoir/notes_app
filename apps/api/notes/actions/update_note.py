"""
Action: partially update an existing note.

Supports updating title, content, and/or category. All fields are optional
(partial update semantics for auto-save support).
"""
from lib.errors import NotFoundError, PermissionDeniedError
from notes.models import Note

_SENTINEL = object()


def update_note(*, note_id, owner, title=_SENTINEL, content=_SENTINEL, category=_SENTINEL) -> Note:
    """
    Partially update the note identified by note_id if it belongs to owner.

    Only fields explicitly passed are updated. Passing category=None clears
    the category assignment.

    Raises NotFoundError if the note does not exist.
    Raises PermissionDeniedError if the owner does not own the note.
    """
    try:
        note = Note.objects.get(id=note_id)
    except Note.DoesNotExist:
        raise NotFoundError("Note not found.")

    if note.owner_id != owner.pk:
        raise PermissionDeniedError("You do not have permission to update this note.")

    changed_fields = []

    if title is not _SENTINEL:
        note.title = title
        changed_fields.append("title")

    if content is not _SENTINEL:
        note.content = content
        changed_fields.append("content")

    if category is not _SENTINEL:
        note.category = category
        changed_fields.append("category")

    if changed_fields:
        # Always touch updated_at by including it in update_fields.
        note.save(update_fields=changed_fields + ["updated_at"])

    return note
