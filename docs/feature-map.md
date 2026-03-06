# Feature Map

Developer reference mapping implemented features to their code paths across the stack.

<!-- When implementing a feature, add an entry following this format:

## Feature Group Name (e.g., Authentication, Notes List)

### Code Paths
- **Backend**
  - Models: apps/api/<module>/models.py
  - Actions: apps/api/<module>/actions/<action>.py
  - Readers: apps/api/<module>/readers/<reader>.py
  - Views: apps/api/<module>/interfaces/api/views.py
  - Schemas: apps/api/<module>/interfaces/api/schemas.py
  - URLs: apps/api/<module>/interfaces/api/urls.py
- **Frontend**
  - Page: apps/web/src/app/<route>/page.tsx
  - Feature: apps/web/src/features/<feature>/
  - Screen Hook: apps/web/src/features/<feature>/hooks/use<Screen>.ts
  - Domain: apps/web/src/domains/<domain>/
  - Repository: apps/web/src/domains/<domain>/repositories/<name>.repository.ts
  - Entity: apps/web/src/domains/<domain>/entities/<name>.entity.ts
  - Rules: apps/web/src/domains/<domain>/rules/<name>.rules.ts
  - Schema: apps/web/src/domains/<domain>/schemas/<name>.schema.ts

Only include sections/lines that exist for the feature. -->

## Infrastructure

### Code Paths

- **Backend**
  - Config: `apps/api/config/settings.py` — INSTALLED_APPS, AUTH_USER_MODEL, DATABASES (PostgreSQL), REST_FRAMEWORK, SPECTACULAR_SETTINGS
  - URLs: `apps/api/config/urls.py` — `/api/v1/schema/`, `/api/v1/schema/swagger-ui/`, `/api/v1/accounts/`, `/api/v1/notes/`
  - Models: `apps/api/accounts/models.py` — custom `User` (email as USERNAME_FIELD)
  - Models: `apps/api/notes/models.py` — `Category` (title, color, UUID PK), `Note` (title, content, category FK, owner FK, UUID PK)
  - Migrations: `apps/api/accounts/migrations/0001_initial.py`
  - Migrations: `apps/api/notes/migrations/0001_initial.py`
  - App stubs: `apps/api/accounts/` — actions/, readers/, lookups/, interfaces/api/ (urls.py, views.py, schemas.py, permissions.py)
  - App stubs: `apps/api/notes/` — actions/, readers/, lookups/, interfaces/api/ (urls.py, views.py, schemas.py, permissions.py)
  - Tests: `apps/api/accounts/tests/test_models.py`
  - Tests: `apps/api/notes/tests/test_models.py`
  - Tests: `apps/api/notes/tests/test_api.py` — OpenAPI schema endpoint contract tests
  - Dependencies: `apps/api/requirements.txt` — Django, djangorestframework, drf-spectacular, psycopg[binary]
  - Docker: `apps/api/Dockerfile`
  - Docker: `docker-compose.yml` — `db` (postgres:16-alpine) and `api` services

## Authentication

<!-- Not yet implemented -->

## Notes List Screen

<!-- Not yet implemented -->

## Note Creation

<!-- Not yet implemented -->

## Note Editing

<!-- Not yet implemented -->

## Categories

<!-- Not yet implemented -->

## Voice Input

<!-- Not yet implemented -->

## Date Display

<!-- Not yet implemented -->
