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
  - URLs: `apps/api/config/urls.py` — `/api/v1/schema/`, `/api/v1/schema/swagger-ui/`, `/api/v1/auth/`, `/api/v1/categories/`
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

### Code Paths

- **Backend (Task 1A — Auth Backend)**
  - Dependencies: `apps/api/requirements.txt` — added `django-allauth[account]`, `dj-rest-auth`
  - Config: `apps/api/config/settings.py` — added `django.contrib.sites`, `rest_framework.authtoken`, `allauth`, `allauth.account`, `dj_rest_auth`, `dj_rest_auth.registration` to INSTALLED_APPS; `allauth.account.middleware.AccountMiddleware` to MIDDLEWARE; switched `DEFAULT_AUTHENTICATION_CLASSES` to `TokenAuthentication`; added `ACCOUNT_*` settings, `REST_AUTH` settings
  - URLs: `apps/api/config/urls.py` — `/api/v1/auth/` mounts `accounts.interfaces.api.urls`
  - Action: `apps/api/accounts/actions/register.py` — `register_user(email, password)` — creates user, raises `ConflictError` on duplicate email
  - Action: `apps/api/accounts/actions/login.py` — `login_user(email, password)` — authenticates user, returns `(User, token_key)` tuple, raises `ValidationError` on bad credentials
  - Action: `apps/api/accounts/actions/logout.py` — `logout_user(token)` — deletes token, effectively invalidating the session
  - Schemas: `apps/api/accounts/interfaces/api/schemas.py` — `RegisterInputSchema`, `LoginInputSchema`, `TokenOutputSchema`, `UserOutputSchema`
  - Views: `apps/api/accounts/interfaces/api/views.py` — `AuthRegisterView`, `AuthLoginView`, `AuthLogoutView`, `AuthTokenRefreshView` (all with `@extend_schema`)
  - URLs: `apps/api/accounts/interfaces/api/urls.py` — `POST /api/v1/auth/register/`, `POST /api/v1/auth/login/`, `POST /api/v1/auth/logout/`, `POST /api/v1/auth/token/refresh/`
  - Tests: `apps/api/accounts/tests/test_actions.py` — unit tests for `register_user`, `login_user`, `logout_user`
  - Tests: `apps/api/accounts/tests/test_auth_api.py` — API contract tests for all four auth endpoints + OpenAPI schema presence
  - Shared lib: `apps/api/lib/errors.py` — `BusinessError`, `NotFoundError`, `PermissionDeniedError`, `UnauthenticatedError`, `ConflictError`, `ValidationError`, `RateLimitError`
  - Shared lib: `apps/api/lib/exceptions.py` — `exception_handler()` — maps domain errors to HTTP responses in the standard `{ error: { code, message, details } }` shape
- **Frontend (Task 1B — Auth Frontend)**
  - Generated models: `apps/web/src/data/generated/model/registerInputSchema.ts`, `loginInputSchema.ts`, `tokenOutputSchema.ts`, `index.ts`
  - Generated hooks: `apps/web/src/data/generated/auth/auth.ts` — `useAuthRegister`, `useAuthLogin`, `useAuthLogout`, `useAuthTokenRefresh` (TanStack Query v5 useMutation wrappers)
  - Token storage: `apps/web/src/lib/auth/tokenStorage.ts` — `getToken()`, `setToken()`, `clearToken()`; writes both localStorage and a browser cookie for middleware auth checks
  - Auth state hook: `apps/web/src/lib/auth/authState.ts` — `useAuthState()` — reactive auth state (isAuthenticated, token, login, logout)
  - Auth guard: `apps/web/src/lib/auth/authGuard.tsx` — `AuthGuard` component — client-side route protection, redirects to /auth/login when unauthenticated
  - Lib barrel: `apps/web/src/lib/auth/index.ts`
  - Fetcher update: `apps/web/src/lib/api/fetcher.ts` — attaches `Authorization: Token <key>` header on every request when authenticated
  - Auth entity: `apps/web/src/domains/auth/entities/auth.entity.ts` — `AuthToken`, `AuthUser`
  - Auth schema: `apps/web/src/domains/auth/schemas/auth.schema.ts` — `loginSchema`, `signUpSchema` (Zod v4); exports `LoginInput`, `SignUpInput`
  - Auth rules: `apps/web/src/domains/auth/rules/auth.rules.ts` — `togglePasswordVisibility()`, `isAuthenticated()`, `getAuthRedirectPath()` (pure functions)
  - Auth repository: `apps/web/src/domains/auth/repositories/auth.repository.ts` — `useAuthRepository()` — wraps generated hooks, stores token on success, invalidates auth query cache
  - Login screen hook: `apps/web/src/features/login/hooks/useLogin.ts` — form state, Zod validation, repository call, redirect to /notes
  - Login form: `apps/web/src/features/login/components/LoginForm.tsx`
  - Signup screen hook: `apps/web/src/features/signup/hooks/useSignup.ts` — form state, Zod validation, repository call, redirect to /notes
  - Signup form: `apps/web/src/features/signup/components/SignupForm.tsx`
  - Password toggle: `apps/web/src/features/login/components/PasswordToggle.tsx` — shared between login and signup
  - Login page: `apps/web/src/app/auth/login/page.tsx`
  - Signup page: `apps/web/src/app/auth/signup/page.tsx`
  - Notes placeholder page: `apps/web/src/app/notes/page.tsx` — redirect target after auth (full implementation in Task 4A)
  - Root page: `apps/web/src/app/page.tsx` — redirects to /notes (middleware handles final destination)
  - Auth guard middleware: `apps/web/src/middleware.ts` — Edge middleware; reads `auth_token` cookie; unauthenticated → /auth/login, authenticated on /auth/* → /notes
  - Dependency added: `zod` ^4.3.6 (was already installed transitively via orval)

## Notes List Screen

<!-- Not yet implemented -->

## Note Creation

<!-- Not yet implemented -->

## Note Editing

<!-- Not yet implemented -->

## Categories

### Code Paths

- **Backend (Task 2A — Categories Backend)**
  - Model: `apps/api/notes/models.py` — `Category` updated to add `user` FK (ForeignKey to AUTH_USER_MODEL, CASCADE, related_name `categories`)
  - Migration: `apps/api/notes/migrations/0002_category_user.py` — adds `user` FK to `Category`
  - Action: `apps/api/notes/actions/seed_categories.py` — `seed_default_categories(user)` — bulk-creates 3 default categories (Random Thoughts #F5A623, School #4A90E2, Personal #7ED321) for a given user
  - Reader: `apps/api/notes/readers/list_categories.py` — `list_categories_for_user(user)` — filters by user, annotates with `note_count` via `Count("notes")`
  - Schemas: `apps/api/notes/interfaces/api/schemas.py` — `CategoryOutputSchema` (id, title, color, note_count, created_at)
  - Views: `apps/api/notes/interfaces/api/views.py` — `CategoryListView` (GET, `@extend_schema`, `IsAuthenticated`)
  - URLs: `apps/api/notes/interfaces/api/urls.py` — `GET /api/v1/categories/`
  - Config URLs: `apps/api/config/urls.py` — mounts `notes.interfaces.api.urls` at `/api/v1/categories/`
  - Registration hook: `apps/api/accounts/actions/register.py` — `register_user()` calls `seed_default_categories(user=user)` after creating the user (side effect explicit in action layer)
  - Tests: `apps/api/notes/tests/test_actions.py` — unit tests for `seed_default_categories` and registration hook
  - Tests: `apps/api/notes/tests/test_readers.py` — unit tests for `list_categories_for_user` (note count, isolation)
  - Tests: `apps/api/notes/tests/test_categories_api.py` — API contract tests for `GET /api/v1/categories/` (auth, response shape, note counts, user isolation, registration flow, OpenAPI schema)

## Voice Input

<!-- Not yet implemented -->

## Date Display

<!-- Not yet implemented -->
