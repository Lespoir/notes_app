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
- **Frontend (Task 0B — Project Structure)**
  - Directory scaffolding: `apps/web/src/app/`, `apps/web/src/data/`, `apps/web/src/domains/`, `apps/web/src/features/`, `apps/web/src/notesDS/`, `apps/web/src/lib/`
  - Path alias: `apps/web/tsconfig.json` — `@/*` → `./src/*`
  - Orval config: `apps/web/orval.config.ts` — input `http://localhost:8000/api/schema/`, output `src/data/generated`, client `react-query`, mutator `src/lib/api/fetcher.ts`
  - Custom fetch: `apps/web/src/lib/api/fetcher.ts` — base URL from `NEXT_PUBLIC_API_URL`, `credentials: include`
  - Query client: `apps/web/src/lib/query/query-client.ts` — `makeQueryClient()` factory + `queryClient` singleton
  - Query provider: `apps/web/src/lib/query/QueryProvider.tsx` — wraps children in `QueryClientProvider` + `ReactQueryDevtools`
  - Query barrel: `apps/web/src/lib/query/index.ts` — exports `makeQueryClient`, `queryClient`, `QueryProvider`
  - Root layout: `apps/web/src/app/layout.tsx` — `<html>`, `<body>`, `QueryProvider` root wrapper
  - Test setup: `apps/web/vitest.config.ts`, `apps/web/vitest.setup.ts`
  - Tests: `apps/web/src/lib/query/__tests__/QueryProvider.test.tsx`
- **Frontend (Task 0C — Design System Foundation)**
  - Theme tokens: `apps/web/src/notesDS/tailwind.css` — `@theme` block with color, radius, shadow, font tokens (Tailwind v4)
  - Globals: `apps/web/src/app/globals.css` — imports notesDS theme tokens
  - Utility: `apps/web/src/notesDS/utils/cn.ts` — `cn()` helper (clsx + tailwind-merge)
  - Layout primitive: `apps/web/src/notesDS/primitives/stack.tsx` — vertical flex container with gap/align/justify/as variants
  - Layout primitive: `apps/web/src/notesDS/primitives/row.tsx` — horizontal flex container with gap/align/justify/wrap/as variants
  - Layout primitive: `apps/web/src/notesDS/primitives/container.tsx` — centered max-width wrapper with size variants (sm/md/lg/xl/full)
  - Layout primitive: `apps/web/src/notesDS/primitives/section.tsx` — semantic section with vertical padding and gap variants
  - Layout primitive: `apps/web/src/notesDS/primitives/cardShell.tsx` — bordered rounded surface with padding variants
  - Typography: `apps/web/src/notesDS/components/ui/typography.tsx` — H1–H4, P, Large, Small, Muted, Lead, Overline
  - Component: `apps/web/src/notesDS/components/ui/button.tsx` — Button with CVA variants (primary, secondary, ghost, icon)
  - Component: `apps/web/src/notesDS/components/ui/input.tsx` — Input with CVA variants (default, error, ghost)
  - Barrel exports: `apps/web/src/notesDS/index.ts` — re-exports all primitives, typography, components, utils
  - Dependencies added: `class-variance-authority`, `clsx`, `tailwind-merge`

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
