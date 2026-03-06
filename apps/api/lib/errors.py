"""
Domain exception types. These are raised by business code (actions, readers, lookups)
and must NOT reference any HTTP concepts. The API layer maps them to HTTP responses.
"""


class BusinessError(Exception):
    """Base class for all domain-level errors."""

    def __init__(self, code: str, message: str, details: dict | None = None):
        self.code = code
        self.message = message
        self.details = details or {}
        super().__init__(message)


class NotFoundError(BusinessError):
    """Resource does not exist or is not accessible to the caller."""

    def __init__(self, message: str = "Not found.", details: dict | None = None):
        super().__init__(code="not_found", message=message, details=details)


class PermissionDeniedError(BusinessError):
    """Caller does not have permission to perform the requested action."""

    def __init__(self, message: str = "Permission denied.", details: dict | None = None):
        super().__init__(code="permission_denied", message=message, details=details)


class UnauthenticatedError(BusinessError):
    """Caller is not authenticated."""

    def __init__(self, message: str = "Authentication required.", details: dict | None = None):
        super().__init__(code="unauthenticated", message=message, details=details)


class ConflictError(BusinessError):
    """Action conflicts with existing state (e.g. duplicate resource)."""

    def __init__(self, message: str = "Conflict.", details: dict | None = None):
        super().__init__(code="conflict", message=message, details=details)


class ValidationError(BusinessError):
    """Input data failed business-level validation."""

    def __init__(self, message: str = "Validation failed.", details: dict | None = None):
        super().__init__(code="validation_error", message=message, details=details)


class RateLimitError(BusinessError):
    """Caller has exceeded the allowed request rate."""

    def __init__(self, message: str = "Rate limit exceeded.", details: dict | None = None):
        super().__init__(code="rate_limit_exceeded", message=message, details=details)
