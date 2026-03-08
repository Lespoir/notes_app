# Notes App — AI-Assisted Development

This project was built end-to-end using **Claude Code** as the primary development assistant. Every layer — from product requirements to production code — was produced through an AI-assisted workflow where the human role was to provide direction and review output, not to write code directly.

---

## How AI Was Used

### 1. Demo Transcript to Product Requirements

The product started as a screen recording of a working prototype. Demo was transcribed into a structured list of user-visible behaviors, then organized them into a feature table with numbered references.

The output lives at [`docs/product/features.md`](docs/product/features.md). It maps each discrete feature to:
- A numbered ID (e.g., `4.3 — Auto-save on edit`)
- An implementation status (`✅ Implemented` / `🟡 Planned`)
- A Figma node link for the corresponding design screen

This document became the single source of truth that everything else — roadmap, architecture, implementation tasks — referenced back to.

---

### 2. Implementation Roadmap

From `features.md`, Claude generated a phased implementation roadmap at [`docs/roadmaps/implementation-roadmap.md`](docs/roadmaps/implementation-roadmap.md).

The roadmap breaks the app into 7 phases (0–6 + polish), each containing one or more tasks scoped for a single agent session. For each task it specifies:
- What it delivers (concrete files and endpoints)
- What it depends on
- What it blocks
- Which features from `features.md` it covers
- A parallelization note (tasks within a phase that have no dependency can run simultaneously)

The dependency graph at the bottom of the file makes the build order explicit and was used directly to coordinate parallel agent sessions.

---

### 3. Figma MCP — Design as Code Input

Claude was connected to the Figma file via the **Figma MCP server** (`mcp__figma__get_design_context`). For each screen, Claude extracted:
- Layout structure (spacing, sizing, alignment)
- Color tokens and typography scale
- Component hierarchy and variant states

Figma URLs are embedded in `features.md` per feature group. During implementation, each agent called `get_design_context` with the relevant `fileKey` and `nodeId` and used the returned design as a reference — not copied verbatim, but mapped to the project's existing design system tokens and CVA variants.

---

### 4. Architecture Decision Records (ADRs)

Before writing any code, Claude evaluated the key technology choices and documented them as ADRs in [`docs/decisions/`](docs/decisions/):

| ADR | Decision | Chosen Option |
|-----|----------|---------------|
| [ADR-001](docs/decisions/001-authentication-method.md) | Authentication method | `dj-rest-auth` + `django-allauth` (batteries-included, fast MVP delivery) |
| [ADR-002](docs/decisions/002-database-engine.md) | Database engine | PostgreSQL via Docker Compose |
| [ADR-003](docs/decisions/003-auto-save-strategy.md) | Auto-save strategy | Debounced PATCH (~1s) + `beforeunload` flush |

Each ADR follows the standard format: context, options with pros/cons, decision, and consequences. These were written before implementation began so that agents implementing later phases had the rationale, not just the outcome.

---

### 5. Architecture Documentation and CLAUDE.md

Claude authored two architecture documents that serve as persistent context for all implementation agents:

- [`docs/architecture/api_architecture.md`](docs/architecture/api_architecture.md) — Django backend: module structure, import rules, data flow, error handling conventions, naming rules, testing patterns
- [`docs/architecture/web_architecture.md`](docs/architecture/web_architecture.md) — Next.js frontend: directory structure, unidirectional import rules, data flow from page to repository to generated hook, design system patterns with code examples

These were then condensed into **[`CLAUDE.md`](CLAUDE.md)** — a project-level instruction file that Claude Code automatically loads at the start of every session. It encodes:
- The full directory layout for both apps
- The import rules as an explicit dependency table
- Do's and Don'ts lists derived from the architecture
- A pointer to the full architecture docs for agents that need deeper examples

`CLAUDE.md` is what allows every implementation agent to follow the same conventions without being given a long briefing each time.

---

### 6. `/implement` Skill — One Command per Roadmap Step

A custom Claude Code skill was created to turn any roadmap task ID into a full implementation session:

```
/implement 4A
```

When invoked, the skill:
1. Reads the task definition from `docs/roadmaps/implementation-roadmap.md`
2. Reads the relevant feature specs from `docs/product/features.md`
3. Reads the applicable architecture doc
4. Fetches the Figma design(s) for the features in scope
5. Reads existing code in affected directories to understand current state
6. Implements the task end-to-end — backend endpoints, domain layer, feature components, tests
7. Opens a PR and updates `docs/feature-map.md` with new code paths

This made each roadmap step a single command. The human reviewed the PR; if the output was correct, it merged and the next task began.

---

### 7. Roadmap Implementation

All 13 tasks (0A through 6A) were implemented by Claude Code agents following the process above. Each task ran in its own branch, produced a pull request, and was merged before the next dependent task began. Parallelizable tasks ran in concurrent agent sessions.

| Phase | Task | PR |
|-------|------|----|
| 0 — Foundation | 0A Backend Setup | [#1](https://github.com/Lespoir/notes_app/pull/1) |
| 0 — Foundation | 0B Frontend Structure | [#2](https://github.com/Lespoir/notes_app/pull/2) |
| 0 — Foundation | 0C Design System | [#3](https://github.com/Lespoir/notes_app/pull/3) |
| 1 — Auth | 1A Auth Backend | [#4](https://github.com/Lespoir/notes_app/pull/4) |
| 1 — Auth | 1B Auth Frontend | [#5](https://github.com/Lespoir/notes_app/pull/5) |
| 2 — Categories | 2A Categories Backend | [#6](https://github.com/Lespoir/notes_app/pull/6) |
| 2 — Categories | 2B Categories Frontend Domain | [#7](https://github.com/Lespoir/notes_app/pull/7) |
| 3 — Notes Backend | 3A Notes CRUD | [#8](https://github.com/Lespoir/notes_app/pull/8) |
| 4 — Notes List | 4A Notes List Frontend | [#9](https://github.com/Lespoir/notes_app/pull/9) |
| 5 — Note Editor | 5A Note Editor Frontend | [#10](https://github.com/Lespoir/notes_app/pull/10) |
| 6 — Voice Input | 6A Voice Input Frontend | [#11](https://github.com/Lespoir/notes_app/pull/11) |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), TypeScript, TanStack Query, Orval |
| Design System | Custom `notesDS`, Tailwind CSS v4, CVA (class-variance-authority) |
| Backend | Django 6.0, Django REST Framework, drf-spectacular |
| Auth | dj-rest-auth + django-allauth (JWT tokens) |
| Database | PostgreSQL (Docker Compose) |
| API Contract | OpenAPI 3.0 (backend-generated) → Orval (frontend-consumed) |
| Voice Input | Web Speech API (browser-native, no server dependency) |

---

## Running the Project

```bash
# Start backend + database
docker-compose up -d

# Install backend dependencies and run migrations
cd apps/api
pip install -r requirements.txt
python manage.py migrate

# Start backend dev server
python manage.py runserver

# Install frontend dependencies and start dev server
cd apps/web
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`. The backend API runs at `http://localhost:8000/api/v1/`.

To regenerate the frontend API hooks after backend schema changes:

```bash
cd apps/web
npm run orval
```
