"""
Auth API views.

Thin wrappers around dj-rest-auth views that add @extend_schema annotations
so drf-spectacular generates an accurate OpenAPI spec for Orval to consume.
"""
from dj_rest_auth.registration.views import RegisterView
from dj_rest_auth.views import LoginView, LogoutView
from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .schemas import LoginInputSchema, RegisterInputSchema, TokenOutputSchema


@extend_schema_view(
    post=extend_schema(
        tags=["auth"],
        operation_id="auth_register",
        summary="Register a new user account",
        request=RegisterInputSchema,
        responses={
            status.HTTP_201_CREATED: TokenOutputSchema,
            status.HTTP_422_UNPROCESSABLE_ENTITY: OpenApiResponse(description="Validation error"),
            status.HTTP_409_CONFLICT: OpenApiResponse(description="Email already registered"),
        },
    )
)
class AuthRegisterView(RegisterView):
    """
    POST /api/v1/auth/register/

    Create a new user account. Returns an auth token on success.
    """


@extend_schema_view(
    post=extend_schema(
        tags=["auth"],
        operation_id="auth_login",
        summary="Log in with email and password",
        request=LoginInputSchema,
        responses={
            status.HTTP_200_OK: TokenOutputSchema,
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(description="Invalid credentials"),
        },
    )
)
class AuthLoginView(LoginView):
    """
    POST /api/v1/auth/login/

    Authenticate with email and password. Returns an auth token on success.
    """


@extend_schema_view(
    post=extend_schema(
        tags=["auth"],
        operation_id="auth_logout",
        summary="Log out the current user",
        request=None,
        responses={
            status.HTTP_200_OK: OpenApiResponse(description="Successfully logged out"),
            status.HTTP_401_UNAUTHORIZED: OpenApiResponse(description="Not authenticated"),
        },
    ),
    get=extend_schema(exclude=True),
)
class AuthLogoutView(LogoutView):
    """
    POST /api/v1/auth/logout/

    Invalidate the current auth token. Requires authentication.
    """

    permission_classes = [IsAuthenticated]


@extend_schema_view(
    post=extend_schema(
        tags=["auth"],
        operation_id="auth_token_refresh",
        summary="Rotate the current auth token",
        request=None,
        responses={
            status.HTTP_200_OK: TokenOutputSchema,
            status.HTTP_401_UNAUTHORIZED: OpenApiResponse(description="Not authenticated"),
        },
    )
)
class AuthTokenRefreshView(APIView):
    """
    POST /api/v1/auth/token/refresh/

    Delete the current token and issue a new one for the authenticated user.
    This is the token-rotation equivalent of a JWT refresh for DRF Token auth.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Delete old token and create a new one.
        Token.objects.filter(user=request.user).delete()
        token, _ = Token.objects.get_or_create(user=request.user)
        return Response(TokenOutputSchema(token).data, status=status.HTTP_200_OK)
