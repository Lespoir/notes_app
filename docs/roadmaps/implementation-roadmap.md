# Implementation Roadmap

## Overview

This roadmap breaks the notes app into phased implementation tasks scoped for agent sessions. Each task is independently executable and produces a working, testable increment.

**Notation:**
- Tasks within the same phase that have no dependency on each other can run **in parallel**
- Tasks across phases are **sequential** — a phase starts only after its dependencies are complete
- Feature references (e.g., `1.1`) map to `docs/product/features.md`
- **Status** uses: `pending`, `done`
- **PR** is added after implementation with the full PR URL (e.g., `https://github.com/org/repo/pull/12`)

---

## Phase 0: Foundation

> Goal: Establish the backend skeleton, frontend project structure, and design system base.

### Task 0A: Backend Project Setup
**Status:** done
**PR:** https://github.com/Lespoir/notes_app/pull/1
**Scope:** Django apps, database config, base models, OpenAPI config
**Delivers:**
- Create `notes` and `accounts` Django apps with model stubs (User, Note, Category)
- Configure `drf-spectacular` for OpenAPI generation
- Configure PostgreSQL via Docker Compose (see ADR-002)
- Set up base URL routing (`/api/v1/`)
- Add initial migrations

**Depends on:** None
**Blocks:** Phase 1, Phase 2, Phase 3

### Task 0B: Frontend Project Structure
**Status:** done
**PR:** https://github.com/Lespoir/notes_app/pull/2
**Scope:** Directory scaffolding, path aliases, base configuration
**Delivers:**
- Create `src/` directory structure (`app/`, `data/`, `domains/`, `features/`, `notesDS/`, `lib/`)
- Configure path alias (`@/*` -> `src/*`)
- Set up Orval config pointing to backend OpenAPI endpoint
- Set up TanStack Query provider
- Add base layout with `<html>`, `<body>`, root providers

**Depends on:** None
**Blocks:** Phase 1, Phase 4, Phase 5

### Task 0C: Design System Foundation
**Status:** done
**PR:** https://github.com/Lespoir/notes_app/pull/3
**Scope:** Core notesDS primitives and typography
**Delivers:**
- Layout primitives: `Stack`, `Row`, `Container`, `Section`, `CardShell`
- Typography components: `H1`-`H4`, `P`, `Large`, `Small`, `Muted`, `Lead`, `Overline`
- Tailwind theme tokens (colors, spacing, fonts) from Figma designs
- CVA setup and pattern for variant components
- `Button` component with variants (primary, secondary, ghost, icon)
- `Input` component with variants

**Depends on:** Task 0B (needs `notesDS/` directory and Tailwind config)
**Blocks:** Phase 1, Phase 4, Phase 5

> **Parallelization:** Tasks 0A and 0B are fully independent — run in parallel. Task 0C starts after 0B completes.

---

## Phase 1: Authentication

> Goal: Users can sign up, log in, and access protected routes.
> Features: 1.1, 1.2, 1.3, 1.4, 1.5

### Task 1A: Auth Backend
**Status:** done
**PR:** https://github.com/Lespoir/notes_app/pull/4
**Scope:** Auth endpoints, user model, token management
**Delivers:**
- Set up `dj-rest-auth` + `django-allauth` (see ADR-001)
- Sign up endpoint (`POST /api/v1/auth/register/`)
- Login endpoint (`POST /api/v1/auth/login/`)
- Logout endpoint (`POST /api/v1/auth/logout/`)
- Token refresh endpoint
- `@extend_schema` annotations on all views
- Unit tests for auth actions + API contract tests

**Depends on:** Task 0A
**Blocks:** Task 1B

### Task 1B: Auth Frontend
**Status:** done
**PR:** https://github.com/Lespoir/notes_app/pull/5
**Scope:** Auth domain, screens, and protected routing
**Delivers:**
- Generate API hooks via Orval from auth endpoints
- `domains/auth/` — repository, entities, schemas (Zod validation for email/password)
- `features/signup/` — screen hook + components (sign up form, password toggle)
- `features/login/` — screen hook + components (login form, password toggle)
- Auth pages in `app/` (login, signup)
- Auth guard / redirect logic (redirect to notes list after login)
- `lib/auth/` — token storage, auth state management

**Depends on:** Task 1A (needs auth API), Task 0C (needs design system components)
**Blocks:** Phase 4 (notes list requires authenticated user)

> **Parallelization:** Task 1A runs alone first. Task 1B follows after 1A completes.

---

## Phase 2: Categories

> Goal: Categories exist in the system with default seed data.
> Features: 5.1, 5.2

### Task 2A: Categories Backend
**Status:** done
**PR:** https://github.com/Lespoir/notes_app/pull/6
**Scope:** Category model, seed data, list endpoint
**Delivers:**
- Category model (title, color) in `notes` app
- Seed data action: create 3 default categories for new users (Random Thoughts, School, Personal)
- Hook into user registration to auto-create default categories
- List categories endpoint (`GET /api/v1/categories/`) with note count annotation
- `@extend_schema` annotations
- Tests

**Depends on:** Task 0A (needs `notes` app and models)
**Blocks:** Task 3A (notes belong to categories)

### Task 2B: Categories Frontend Domain
**Status:** pending
**Scope:** Category domain layer only (no UI yet — sidebar is built in Phase 4)
**Delivers:**
- Generate API hooks via Orval from categories endpoints
- `domains/categories/` — entity, repository, schemas

**Depends on:** Task 2A (needs categories API), Task 0B (needs domain structure)
**Blocks:** Phase 4 (sidebar needs category repository)

> **Parallelization:** Task 2A can run in parallel with Phase 1 tasks (independent backend work). Task 2B follows after 2A.

---

## Phase 3: Notes CRUD Backend

> Goal: Full notes API — create, read, update, delete.
> Features: 3.1, 3.2, 4.1, 4.2, 4.3, 4.5, 4.7

### Task 3A: Notes Backend
**Status:** pending
**Scope:** Note model, CRUD endpoints, auto-save support
**Delivers:**
- Note model (title, content, category FK, timestamps) in `notes` app
- Create note action (`POST /api/v1/notes/`) — creates with default empty title/content
- List notes reader (`GET /api/v1/notes/`) — with category filter query param, ordered by last edited
- Retrieve note reader (`GET /api/v1/notes/{id}/`)
- Update note action (`PATCH /api/v1/notes/{id}/`) — partial update for debounced auto-save
- Delete note action (`DELETE /api/v1/notes/{id}/`)
- `@extend_schema` annotations on all views
- Tests for all actions + API contract tests

**Depends on:** Task 2A (notes reference categories)
**Blocks:** Phase 4, Phase 5

> **Parallelization:** This task runs alone. It depends on categories but is independent of auth frontend work.

---

## Phase 4: Notes List Screen

> Goal: Users see their notes, filter by category, and create new notes.
> Features: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 5.3, 5.4, 5.5, 5.6, 7.1, 7.2, 7.3, 7.4

### Task 4A: Notes List Frontend
**Status:** pending
**Scope:** Notes domain + notes list feature + category sidebar
**Delivers:**
- Generate API hooks via Orval from notes endpoints
- `domains/notes/` — entity, repository (list, create, delete), rules (date display formatting: today/yesterday/date)
- `features/notes-list/` — screen hook + components:
  - Note preview card (title, content preview, category color, formatted date)
  - Empty state
  - New note button (creates note + navigates to editor)
  - Category sidebar (category list with color indicator, title, note count, "All categories" filter)
- Notes list page in `app/`
- Category filtering (click category -> filter notes, click "All" -> remove filter)

**Depends on:** Task 1B (auth guard), Task 2B (category domain), Task 3A (notes API), Task 0C (design system)
**Blocks:** Phase 5 (navigation from list to editor)

> **Parallelization:** None — this task has multiple dependencies that must all complete first.

---

## Phase 5: Note Editor Screen

> Goal: Users can edit notes with auto-save and category assignment.
> Features: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7

### Task 5A: Note Editor Frontend
**Status:** pending
**Scope:** Note editor feature with markdown editing and auto-save
**Delivers:**
- Integrate a markdown editor library (e.g., `@uiw/react-md-editor` or `react-markdown` + `react-textarea-autosize`)
- `features/note-editor/` — screen hook + components:
  - Inline editable title
  - Markdown editor for note content (with live preview or WYSIWYG)
  - Category dropdown selector
  - Background color change based on selected category
  - Last-edited timestamp (auto-updating)
  - Close/back button to return to notes list
- Auto-save implementation (debounced PATCH ~1s, flush on `beforeunload` — see ADR-003)
- `domains/notes/` additions — update repository method, auto-save hook logic
- Note editor page in `app/`
- Note content stored as markdown in the backend; rendered as markdown in the preview cards (Task 4A may need a small update to render truncated markdown)

**Depends on:** Task 4A (navigation from list, shared notes domain)
**Blocks:** Phase 6 (voice input is added to the editor)

> **Parallelization:** None — depends on notes list being complete.

---

## Phase 6: Voice Input

> Goal: Users can dictate notes using their microphone.
> Features: 6.1, 6.2, 6.3, 6.4, 6.5

### Task 6A: Voice Input Frontend
**Status:** pending
**Scope:** Web Speech API integration on note editor
**Delivers:**
- `features/note-editor/` additions:
  - Microphone button to start voice input
  - Stop button to end recording
  - Green dot recording indicator
- `lib/speech/` or `domains/notes/` hook — Web Speech API wrapper (`useSpeechToText`)
- Transcribed text appended to note content field
- Auto-save triggers after transcription completes

**Depends on:** Task 5A (voice input lives on the editor screen)
**Blocks:** None

> **Parallelization:** None — depends on editor being complete.

---

## Phase 7: Polish and Documentation

> Goal: Final QA pass, update all tracking docs.

### Task 7A: Polish + Docs
**Status:** pending
**Scope:** Cross-cutting cleanup, doc updates
**Delivers:**
- Verify all features in `docs/product/features.md` and mark as implemented
- Update `docs/feature-map.md` with all created/modified code paths
- Mark ADR decisions as "Accepted" with chosen options
- Fix any remaining UI inconsistencies against Figma designs
- Ensure OpenAPI spec is accurate and Orval generates clean hooks

**Depends on:** All previous phases
**Blocks:** None

---

## Dependency Graph

```
Phase 0A (Backend Setup) ──────────┬──> Phase 1A (Auth Backend) ──> Phase 1B (Auth Frontend) ──┐
                                   │                                                            │
                                   ├──> Phase 2A (Categories Backend) ──> Phase 2B (Cat. FE) ──┤
                                   │                         │                                  │
                                   │                         └──> Phase 3A (Notes Backend) ─────┤
                                   │                                                            │
Phase 0B (FE Structure) ──> Phase 0C (Design System) ──────────────────────────────────────────┤
                                                                                                │
                                                                                                v
                                                                              Phase 4A (Notes List FE)
                                                                                                │
                                                                                                v
                                                                              Phase 5A (Note Editor FE)
                                                                                                │
                                                                                                v
                                                                              Phase 6A (Voice Input FE)
                                                                                                │
                                                                                                v
                                                                              Phase 7A (Polish + Docs)
```

## Parallelization Summary

| Window | Tasks that can run in parallel | Notes |
|--------|-------------------------------|-------|
| 1 | Task 0A + Task 0B | Backend and frontend setup are independent |
| 2 | Task 0C + Task 1A + Task 2A | Design system, auth backend, and categories backend are independent |
| 3 | Task 1B + Task 2B + Task 3A | Auth frontend, category frontend domain, and notes backend (if deps met) |
| 4-7 | Tasks 4A, 5A, 6A, 7A | Sequential — each depends on the previous |

## Feature Coverage

| Feature Group | Features | Covered in Task(s) |
|---------------|----------|---------------------|
| 1. Authentication | 1.1-1.5 | 1A, 1B |
| 2. Notes List Screen | 2.1-2.6 | 4A |
| 3. Note Creation | 3.1-3.3 | 3A (backend), 4A (frontend) |
| 4. Note Editing | 4.1-4.7 | 3A (backend), 5A (frontend) |
| 5. Categories | 5.1-5.6 | 2A (backend), 2B (domain), 4A (sidebar UI) |
| 6. Voice Input | 6.1-6.5 | 6A |
| 7. Date Display | 7.1-7.4 | 4A (rules + UI) |
