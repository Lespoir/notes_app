# ADR-001: Authentication Method

## Status

Accepted

## Context

Features 1.1-1.5 require user authentication (sign up, login, session management, redirect after auth). The backend is Django + DRF and the frontend is Next.js. We need to decide on the authentication mechanism and supporting Django packages.

Key requirements:
- Email + password sign up and login
- Token-based auth suitable for a decoupled SPA frontend
- Secure session persistence across page reloads
- Simple enough for the current scope (no OAuth, no social login)

## Options

### Option A: `dj-rest-auth` + `django-allauth`

A batteries-included solution. `django-allauth` handles user registration, email verification, and account management. `dj-rest-auth` exposes REST endpoints on top of it.

**Pros:**
- Pre-built registration, login, logout, password reset endpoints
- Battle-tested and widely adopted in Django+SPA projects
- Easy to extend later with social auth (Google, GitHub) if needed
- Token or JWT support via configuration

**Cons:**
- Heavier dependency footprint; `django-allauth` brings many features we don't need (social auth, email verification flows)
- Opinionated URL structure and serializer shapes may require overrides to match our API conventions
- More abstraction layers to debug when something breaks

### Option B: `djangorestframework-simplejwt` with custom views

Use `simplejwt` for token issuance and verification, and write custom DRF views for sign up, login, and token refresh.

**Pros:**
- Lightweight — only adds JWT handling, no unnecessary features
- Full control over endpoint shape, serializers, and response format
- Aligns well with our thin-view architecture (views delegate to actions)
- Easier to generate a clean OpenAPI spec since we control the serializers

**Cons:**
- Must implement registration, login, and token refresh views manually
- No built-in password reset or email verification (would need to build if required later)
- More initial development effort

### Option C: Django session auth with CSRF tokens

Use Django's built-in session framework. The frontend sends cookies and CSRF tokens with each request.

**Pros:**
- Zero additional dependencies
- Battle-tested Django session infrastructure
- Simple mental model — no token management on the client

**Cons:**
- CSRF handling adds complexity to the SPA (must fetch and attach CSRF tokens)
- Sessions are server-stateful, which complicates horizontal scaling later
- Less conventional for decoupled SPA architectures; most SPA+API projects use token-based auth
- Harder to use from non-browser clients (mobile, CLI) if scope expands

## Decision

**Option A: `dj-rest-auth` + `django-allauth`.**

For an MVP, speed of delivery matters more than architectural purity. `dj-rest-auth` provides ready-made registration, login, logout, and token endpoints that map directly to features 1.1-1.5. The extra features bundled by `django-allauth` (social auth, email verification) can be ignored initially and enabled later if needed. The opinionated serializer shapes are an acceptable tradeoff — we can override specific serializers where the generated OpenAPI spec needs adjustment.

## Consequences

- **Dependencies:** Add `dj-rest-auth` and `django-allauth` to backend requirements.
- **Configuration:** Register `allauth` and `dj-rest-auth` in `INSTALLED_APPS`, configure `REST_AUTH` settings for token-based auth.
- **URL routing:** Mount `dj-rest-auth` URLs under `/api/v1/auth/`. Override serializers where needed to keep the OpenAPI spec clean.
- **Frontend token handling:** Store the auth token (from `dj-rest-auth` token endpoint) in `lib/auth/` and attach it to all API requests via an Axios interceptor.
- **OpenAPI impact:** Auth endpoints need `@extend_schema` overrides on top of `dj-rest-auth` views to ensure `drf-spectacular` generates accurate types for Orval.
- **Future flexibility:** If social auth or email verification is needed later, `django-allauth` already supports it — no migration required.
