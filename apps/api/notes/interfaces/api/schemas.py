"""
Serializers for the notes API.

These define the exact request/response shapes that drive the OpenAPI spec
consumed by the frontend via Orval.
"""
from drf_spectacular.utils import extend_schema_field
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
