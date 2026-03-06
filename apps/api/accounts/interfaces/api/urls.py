from django.urls import path

from .views import AuthLoginView, AuthLogoutView, AuthRegisterView, AuthTokenRefreshView

urlpatterns = [
    path("register/", AuthRegisterView.as_view(), name="auth-register"),
    path("login/", AuthLoginView.as_view(), name="auth-login"),
    path("logout/", AuthLogoutView.as_view(), name="auth-logout"),
    path("token/refresh/", AuthTokenRefreshView.as_view(), name="auth-token-refresh"),
]
