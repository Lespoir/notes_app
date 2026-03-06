"""
Notes API views.
"""
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from notes.readers.list_categories import list_categories_for_user

from .schemas import CategoryOutputSchema


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
