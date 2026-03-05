# Backend Architecture Rules (Django)

This document defines architecture and coding rules for the Django backend.

These rules must be followed when creating or modifying backend code.

---

## Non‑negotiable Principles

1. **DRF is transport only.**
   - Views/serializers parse/validate input and format output.
   - Business rules do **not** live in views/serializers.

2. **Explicit read vs write split.**
   - Reads go in `readers/`
   - Writes/state changes go in `actions/`

3. **Cross-entity reads for actions use `lookups/`.**
   - Actions may depend on `lookups/` from other modules.
   - Actions should not depend on other modules’ “presentation readers”.

4. **Business errors are exceptions. HTTP mapping is API-only.**
   - No HTTP status codes outside the API layer.

5. **Avoid hidden side effects.**
   - Do not use Django signals for core workflows.
   - Side effects must be explicit in actions.

---

## Directory Conventions

Within each Django module/app:

```
<module>/
  models.py
  actions/
    __init__.py
  readers/
    __init__.py
  lookups/
    __init__.py
  interfaces/
    api/
      __init__.py
      urls.py
      views.py
      schemas.py      # DRF serializers
      permissions.py  # DRF permissions (optional)
  tests/
```

**Allowed imports**
- `interfaces/api/*` may import DRF.
- `actions/`, `readers/`, `lookups/` must **not** import DRF.

---

## What Goes Where (Decision Table)

### Put it in `actions/` when…
- It **changes state** (create/update/delete/soft delete).
- It enforces **business invariants**.
- It triggers explicit side effects (send email, enqueue job, write audit).

### Put it in `readers/` when…
- It is **read-only**.
- It composes ORM queries (filters, ordering, pagination).
- It uses `select_related`/`prefetch_related` to avoid N+1.
- It shapes output data (projection/aggregation) for API responses.

### Put it in `lookups/` when…
- An action needs a **minimal read** to make a decision:
  - existence checks
  - fetching a foreign key id
  - verifying a status flag

**Rule of thumb:**
- Use a **lookup** when you only need enough data to decide.
- Use a **reader** when you need data to present to clients.

---

## DRF Usage Rules

### Views
- Keep views thin:
  1) validate input with serializer
  2) call action/reader
  3) serialize output

- No complex ORM query building in views.
- No business rules in views.

### Serializers (`schemas.py`)
- Serializer responsibilities:
  - validate request data
  - normalize types
  - serialize response shape

- Avoid placing business logic in `create()`/`update()`.
  - Only allow trivial mapping if explicitly instructed.

---

## Business Errors → HTTP Mapping

### Business Error Types (in business layer)
Business code raises exceptions that inherit from a base `BusinessError`:

- `BusinessError(code: str, message: str, details: dict | None = None)`

Suggested subclasses:
- `NotFoundError` → 404
- `PermissionDeniedError` → 403
- `UnauthenticatedError` → 401 (only if not handled upstream)
- `ConflictError` → 409
- `ValidationError` → 422 (preferred) or 400 (choose one and be consistent)
- `RateLimitError` → 429

### API Error Response Shape

```json
{
  "error": {
    "code": "stable_machine_code",
    "message": "human_readable_message",
    "details": {"optional": "context"}
  }
}
```

### Exception Mapping

Business exceptions raised in the domain layer are translated into HTTP responses in the API layer.

This translation is performed by a centralized exception mapping mechanism in the API layer, which converts domain errors into:

  - an HTTP status code
  - the standard API error response format

Domain modules (`actions/`, `readers/`, `lookups/`) remain unaware of HTTP concepts and only raise domain-level exceptions.

---

## OpenAPI Schema Generation (`drf-spectacular`)

The backend generates an OpenAPI specification that the frontend consumes to auto-generate type-safe API clients (via Orval).

### Rules

1. **Every view must have `@extend_schema`.**
   - Specify `request`, `responses`, and `parameters` explicitly.
   - Do not rely on automatic DRF introspection alone — it produces incomplete or inaccurate schemas.

2. **Serializers are the schema source of truth.**
   - The serializers in `schemas.py` define the exact request/response shapes in the OpenAPI spec.
   - Keep them precise: use explicit fields, avoid `SerializerMethodField` without `@extend_schema_field`.

3. **Annotate non-obvious fields.**
   - Use `@extend_schema_field` for computed/method fields.
   - Use `OpenApiTypes` for fields that DRF cannot infer (e.g., `UUIDField` in URL params).

4. **Tag views by module.**
   - Use `tags` in `@extend_schema` matching the module name (e.g., `tags=["notes"]`).
   - This maps to Orval's per-tag file generation (`data/generated/[tag]/[tag].ts`).

### Example

```python
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..schemas import CreateNoteInputSchema, NoteOutputSchema


class NoteCreateView(APIView):
    @extend_schema(
        tags=["notes"],
        request=CreateNoteInputSchema,
        responses={status.HTTP_201_CREATED: NoteOutputSchema},
    )
    def post(self, request):
        serializer = CreateNoteInputSchema(data=request.data)
        serializer.is_valid(raise_exception=True)
        note = create_note(**serializer.validated_data)
        return Response(NoteOutputSchema(note).data, status=status.HTTP_201_CREATED)
```

---

## Testing Rules

Minimum per feature change:
- **Unit tests** for actions/lookups (fast):
  - invariants
  - permission checks
  - idempotency where relevant
- **API tests** for endpoint contract (integration):
  - auth wiring
  - status codes
  - response shape

Avoid tests that only assert implementation details.

---

## Performance Rules

- Readers own performance.
- Use `select_related`/`prefetch_related` inside readers.
- Avoid N+1 patterns.
- Lookups must be lightweight:
  - prefer `values_list`/`only`
  - avoid heavy prefetching

---

## Naming & Style Conventions

### Function naming
- Actions: verb-first
  - `create_*`, `update_*`, `delete_*`, `soft_delete_*`, `assign_*`, `invite_*`
- Readers: noun/intent-first
  - `get_*`, `list_*`, `search_*`, `fetch_*`
- Lookups: `find_*`
  - `find_*_id_by_*`

## Return types

Actions may return:
- **Model instance(s)** when the immediate caller needs the entity and the API layer will serialize it.
  - This is the default for single-entity create/update flows.
- **Small primitives/IDs** when the entity itself is not needed by the caller.
  - Typical for commands where only the identifier or outcome matters.
- **Result/DTO dataclasses** only when the outcome is **not a single entity** or must capture multiple values/states.
  - Use when returning multiple IDs, reporting `created vs noop`, or summarizing changes (added/removed).

Readers typically return:
- **QuerySets or model instances** when the API layer will serialize the entity.

Readers may return **plain dictionaries or lists** only when the response does not map directly to a single entity (for example aggregated data, projections, or computed summaries).

Prefer returning QuerySets whenever possible. The API layer is responsible for serialization.

Response shaping should remain simple and consistent within the module.
Readers should not construct complex nested API responses.

---
