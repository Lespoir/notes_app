"""
Centralized exception handler for the DRF API layer.

Maps domain-level BusinessError subclasses to HTTP status codes and formats
all errors into the standard API error response shape:

    {
        "error": {
            "code": "stable_machine_code",
            "message": "human_readable_message",
            "details": { ... }
        }
    }
"""
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

from lib.errors import (
    BusinessError,
    ConflictError,
    NotFoundError,
    PermissionDeniedError,
    RateLimitError,
    UnauthenticatedError,
    ValidationError,
)

_BUSINESS_ERROR_STATUS_MAP = {
    NotFoundError: status.HTTP_404_NOT_FOUND,
    PermissionDeniedError: status.HTTP_403_FORBIDDEN,
    UnauthenticatedError: status.HTTP_401_UNAUTHORIZED,
    ConflictError: status.HTTP_409_CONFLICT,
    ValidationError: status.HTTP_422_UNPROCESSABLE_ENTITY,
    RateLimitError: status.HTTP_429_TOO_MANY_REQUESTS,
    BusinessError: status.HTTP_400_BAD_REQUEST,
}


def _error_response(code: str, message: str, details: dict, http_status: int) -> Response:
    payload = {"error": {"code": code, "message": message}}
    if details:
        payload["error"]["details"] = details
    return Response(payload, status=http_status)


def exception_handler(exc, context):
    # Handle domain exceptions first.
    for exc_class, http_status in _BUSINESS_ERROR_STATUS_MAP.items():
        if isinstance(exc, exc_class):
            return _error_response(
                code=exc.code,
                message=exc.message,
                details=exc.details,
                http_status=http_status,
            )

    # Fall back to DRF's built-in handler for DRF exceptions
    # (e.g. AuthenticationFailed, NotAuthenticated, ValidationError).
    response = drf_exception_handler(exc, context)
    return response
