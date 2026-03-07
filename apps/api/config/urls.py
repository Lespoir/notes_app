from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from notes.interfaces.api.urls import categories_urlpatterns, notes_urlpatterns

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/v1/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/v1/auth/', include('accounts.interfaces.api.urls')),
    path('api/v1/categories/', include(categories_urlpatterns)),
    path('api/v1/notes/', include(notes_urlpatterns)),
]
