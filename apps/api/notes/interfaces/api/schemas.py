"""
Serializers for the notes API.

These define the exact request/response shapes that drive the OpenAPI spec
consumed by the frontend via Orval.
"""
from rest_framework import serializers


# ---------------------------------------------------------------------------
# Category
# ---------------------------------------------------------------------------

class CategoryOutputSchema(serializers.Serializer):
    """Response schema for a single category."""

    id = serializers.UUIDField(read_only=True)
    title = serializers.CharField(read_only=True)
    color = serializers.CharField(read_only=True)
    note_count = serializers.IntegerField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)


# ---------------------------------------------------------------------------
# Note
# ---------------------------------------------------------------------------

class NoteCategoryOutputSchema(serializers.Serializer):
    """Embedded category representation within a note response."""

    id = serializers.UUIDField(read_only=True)
    title = serializers.CharField(read_only=True)
    color = serializers.CharField(read_only=True)


class NoteOutputSchema(serializers.Serializer):
    """Response schema for a single note."""

    id = serializers.UUIDField(read_only=True)
    title = serializers.CharField(read_only=True)
    content = serializers.CharField(read_only=True)
    category = NoteCategoryOutputSchema(read_only=True, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)


class NoteCreateInputSchema(serializers.Serializer):
    """Request body for creating a note. All fields are optional."""

    category = serializers.UUIDField(required=False, allow_null=True, default=None)


class NoteUpdateInputSchema(serializers.Serializer):
    """Request body for partially updating a note."""

    title = serializers.CharField(required=False, allow_blank=True, max_length=255)
    content = serializers.CharField(required=False, allow_blank=True)
    category = serializers.UUIDField(required=False, allow_null=True)
