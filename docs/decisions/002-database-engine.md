# ADR-002: Database Engine

## Status

Accepted

## Context

Django defaults to SQLite. The notes app needs a database for users, notes, and categories. We need to decide whether to use SQLite, PostgreSQL, or a hybrid approach. The app is a single-user-per-account CRUD application with no complex queries, full-text search, or high concurrency requirements at this stage.

## Options

### Option A: SQLite everywhere

Use SQLite for both development and production.

**Pros:**
- Zero setup — works out of the box with Django
- No external service to manage or provision
- Extremely fast for low-concurrency, single-server workloads
- Simpler deployment (database is a single file)
- Sufficient for a notes app with modest scale

**Cons:**
- Limited write concurrency (single writer lock)
- Fewer data types and constraints compared to PostgreSQL
- No built-in support for JSON queries, full-text search, or advanced indexing
- Harder to migrate away from later if production needs grow
- Not supported by some hosting platforms that expect a separate DB service

### Option B: SQLite for development / PostgreSQL for production

Use SQLite locally for fast iteration and PostgreSQL in production.

**Pros:**
- Fast local development with no external dependencies
- Production gets PostgreSQL's concurrency, reliability, and feature set
- Common pattern in Django tutorials and small projects

**Cons:**
- ORM behavior differences between SQLite and PostgreSQL can cause subtle bugs (e.g., type coercion, collation, constraint enforcement)
- Tests run against a different engine than production — bugs may only surface in production
- Must maintain two database configurations
- Django docs explicitly warn against using different databases in dev and prod

### Option C: PostgreSQL from day one

Use PostgreSQL in both development and production.

**Pros:**
- Dev/prod parity — no ORM behavior surprises
- Full feature set available from the start (JSONB, full-text search, array fields, advisory locks)
- Industry standard for Django production deployments
- Easy to provision locally via Docker or Homebrew

**Cons:**
- Requires PostgreSQL running locally (Docker or native install)
- Slightly more setup for new contributors
- Overhead may be unnecessary for a simple CRUD app at this stage

## Decision

**Option C: PostgreSQL from day one, provisioned via Docker Compose.**

Dev/prod parity eliminates an entire class of subtle ORM behavior bugs. The overhead of running PostgreSQL locally is minimal with Docker Compose — a single `docker compose up` starts both the Django backend and a PostgreSQL instance. This also establishes the Docker Compose workflow early, making it easy to add services (Redis, Celery) later without changing the development setup.

## Consequences

- **Docker Compose:** Add a `docker-compose.yml` at the repo root with `db` (PostgreSQL) and `api` (Django) services. The `api` service depends on `db`.
- **Dependencies:** Add `psycopg[binary]` to backend requirements.
- **Django settings:** Configure `DATABASES` to read `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` from environment variables, with defaults pointing to the Docker Compose PostgreSQL service.
- **Developer setup:** Contributors must have Docker installed. Running `docker compose up` is the single command to start the backend. Document this in the project README.
- **CI/CD:** Tests run against PostgreSQL (same engine as production), so CI needs a PostgreSQL service or uses the same Docker Compose setup.
- **No SQLite fallback:** There is no SQLite configuration. This is intentional — it prevents accidental dev/prod drift.
