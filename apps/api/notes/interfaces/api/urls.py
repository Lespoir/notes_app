from django.urls import path

from .views import CategoryListView, NoteDetailView, NoteListCreateView

categories_urlpatterns = [
    path("", CategoryListView.as_view(), name="category-list"),
]

notes_urlpatterns = [
    path("", NoteListCreateView.as_view(), name="note-list-create"),
    path("<uuid:note_id>/", NoteDetailView.as_view(), name="note-detail"),
]
