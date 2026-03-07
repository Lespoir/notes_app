"""
Notes API views.
"""
from drf_spectacular.utils import OpenApiParameter, extend_schema
from drf_spectacular.types import OpenApiTypes
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from notes.actions.create_note import create_note
from notes.actions.delete_note import delete_note
from notes.actions.update_note import update_note
from notes.lookups.find_category import find_category_for_user
from notes.readers.get_note import get_note
from notes.readers.list_categories import list_categories_for_user
from notes.readers.list_notes import list_notes

from .schemas import (
    CategoryOutputSchema,
    NoteCreateInputSchema,
    NoteOutputSchema,
    NoteUpdateInputSchema,
)


class CategoryListView(APIView):
    """
    GET /api/v1/categories/

    List all categories for the authenticated user, each annotated with the
    count of notes assigned to that category.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["categories"],
        operation_id="categories_list",
        summary="List all categories for the authenticated user",
        responses={
            status.HTTP_200_OK: CategoryOutputSchema(many=True),
            status.HTTP_401_UNAUTHORIZED: None,
        },
    )
    def get(self, request):
        categories = list_categories_for_user(user=request.user)
        serializer = CategoryOutputSchema(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class NoteListCreateView(APIView):
    """
    GET  /api/v1/notes/  — list the authenticated user's notes
    POST /api/v1/notes/  — create a new note
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["notes"],
        operation_id="notes_list",
        summary="List notes for the authenticated user",
        parameters=[
            OpenApiParameter(
                name="category",
                type=OpenApiTypes.UUID,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Filter notes by category UUID.",
            )
        ],
        responses={
            status.HTTP_200_OK: NoteOutputSchema(many=True),
            status.HTTP_401_UNAUTHORIZED: None,
        },
    )
    def get(self, request):
        category_id = request.query_params.get("category") or None
        notes = list_notes(owner=request.user, category_id=category_id)
        serializer = NoteOutputSchema(notes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=["notes"],
        operation_id="notes_create",
        summary="Create a new note",
        request=NoteCreateInputSchema,
        responses={
            status.HTTP_201_CREATED: NoteOutputSchema,
            status.HTTP_401_UNAUTHORIZED: None,
            status.HTTP_404_NOT_FOUND: None,
        },
    )
    def post(self, request):
        serializer = NoteCreateInputSchema(data=request.data)
        serializer.is_valid(raise_exception=True)
        category_uuid = serializer.validated_data.get("category")
        category = find_category_for_user(category_id=category_uuid, user=request.user) if category_uuid else None
        note = create_note(owner=request.user, category=category)
        return Response(NoteOutputSchema(note).data, status=status.HTTP_201_CREATED)


class NoteDetailView(APIView):
    """
    GET    /api/v1/notes/{id}/  — retrieve a single note
    PATCH  /api/v1/notes/{id}/  — partially update a note
    DELETE /api/v1/notes/{id}/  — delete a note
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["notes"],
        operation_id="notes_retrieve",
        summary="Retrieve a single note",
        parameters=[
            OpenApiParameter(
                name="id",
                type=OpenApiTypes.UUID,
                location=OpenApiParameter.PATH,
                description="UUID of the note to retrieve.",
            )
        ],
        responses={
            status.HTTP_200_OK: NoteOutputSchema,
            status.HTTP_401_UNAUTHORIZED: None,
            status.HTTP_404_NOT_FOUND: None,
        },
    )
    def get(self, request, note_id):
        note = get_note(note_id=note_id, owner=request.user)
        return Response(NoteOutputSchema(note).data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=["notes"],
        operation_id="notes_partial_update",
        summary="Partially update a note (auto-save)",
        parameters=[
            OpenApiParameter(
                name="id",
                type=OpenApiTypes.UUID,
                location=OpenApiParameter.PATH,
                description="UUID of the note to update.",
            )
        ],
        request=NoteUpdateInputSchema,
        responses={
            status.HTTP_200_OK: NoteOutputSchema,
            status.HTTP_401_UNAUTHORIZED: None,
            status.HTTP_404_NOT_FOUND: None,
        },
    )
    def patch(self, request, note_id):
        serializer = NoteUpdateInputSchema(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        kwargs = {}
        if "title" in data:
            kwargs["title"] = data["title"]
        if "content" in data:
            kwargs["content"] = data["content"]
        if "category" in data:
            category_uuid = data["category"]
            kwargs["category"] = find_category_for_user(category_id=category_uuid, user=request.user) if category_uuid else None
        note = update_note(note_id=note_id, owner=request.user, **kwargs)
        return Response(NoteOutputSchema(note).data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=["notes"],
        operation_id="notes_destroy",
        summary="Delete a note",
        parameters=[
            OpenApiParameter(
                name="id",
                type=OpenApiTypes.UUID,
                location=OpenApiParameter.PATH,
                description="UUID of the note to delete.",
            )
        ],
        responses={
            status.HTTP_204_NO_CONTENT: None,
            status.HTTP_401_UNAUTHORIZED: None,
            status.HTTP_404_NOT_FOUND: None,
        },
    )
    def delete(self, request, note_id):
        delete_note(note_id=note_id, owner=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)
