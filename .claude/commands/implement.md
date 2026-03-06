---
description: Implement a task from the implementation roadmap (e.g., /implement 0A)
---

# Implement Roadmap Task: $ARGUMENTS

You are an **orchestrator**. You do NOT write code yourself. You read the roadmap, determine the task type, create a branch, launch sub-agents to do the work, and create a PR at the end.

---

## Step 1: Read the roadmap and locate the task

Read `docs/roadmaps/implementation-roadmap.md` and find the section for task **$ARGUMENTS** (e.g., "Task 0A", "Task 1B", etc.).

If the task ID is not found, stop and tell the user: "Task '$ARGUMENTS' not found in the roadmap. Available tasks: 0A, 0B, 0C, 1A, 1B, 2A, 2B, 3A, 4A, 5A, 6A, 7A."

Extract from the task section:
- **Scope** and **Delivers** (what to build)
- **Depends on** (prerequisite tasks)
- **Feature references** (e.g., "1.1, 1.2" mapping to `docs/product/features.md`)

## Step 2: Check dependencies

Review the **Depends on** field. For each dependency, check its **Status** field in the roadmap.

- If any dependency has `**Status:** pending`, warn the user clearly: "Warning: Task $ARGUMENTS depends on [X], which is still pending. Proceeding may result in errors. Continue anyway?"
- If all dependencies have `**Status:** done` (or the task has no dependencies), note this and proceed.

## Step 3: Determine task type

Classify the task:
- **Backend only:** Tasks 0A, 1A, 2A, 3A
- **Frontend only:** Tasks 0B, 0C, 1B, 2B, 4A, 5A, 6A
- **Both:** Task 7A (or any task that explicitly touches both)

## Step 4: Create a feature branch

Pull the latest from main before branching to minimize conflicts:

```
git checkout master && git pull origin master && git checkout -b task/$ARGUMENTS
```

## Step 5: Launch sub-agents

You will launch agents in two waves. **Wave 1** (test + implementation) runs in parallel. **Wave 2** (review) runs after Wave 1 completes.

### Wave 1: Test Agent(s) + Implementation Agent(s)

Launch these agents **in parallel**. For tasks that are "both" backend and frontend, launch separate agents for each side (up to 4 agents total in Wave 1).

#### Test Agent (one per side: backend / frontend)

Launch with the Agent tool using the following prompt (adapt "backend"/"frontend" based on which side):

> You are a **test agent** for task **$ARGUMENTS**. Your job is to write tests ONLY — no implementation code.
>
> **Setup:**
> 1. Read `docs/roadmaps/implementation-roadmap.md` and find task **$ARGUMENTS** — understand what it delivers
> 2. Read `docs/product/features.md` for the feature specs referenced by the task
> 3. Read the relevant architecture doc:
>    - Backend: `docs/architecture/api_architecture.md`
>    - Frontend: `docs/architecture/web_architecture.md`
> 4. Read any ADRs referenced in the task description (check `docs/decisions/`)
>
> **Your deliverable:**
> Write unit tests and/or integration tests for the [backend/frontend] deliverables of this task.
>
> **Backend test conventions:**
> - Unit tests for actions and lookups
> - API contract tests for endpoint request/response shapes
> - Place tests in `<module>/tests/`
> - Tests should define the expected behavior from the task's **Delivers** section
>
> **Frontend test conventions:**
> - Test domain rules (pure functions) with unit tests
> - Test repositories if they have transformation logic
> - Place tests alongside the code they test
> - Tests should define the expected behavior from the task's **Delivers** section
>
> **Rules:**
> - Follow CLAUDE.md conventions strictly
> - Do NOT write implementation code — only tests
> - Tests may initially fail (red phase of TDD) — that is expected
> - Write tests based on the task spec, not on existing code

#### Implementation Agent (one per side: backend / frontend)

Launch with the Agent tool using the following prompt (adapt "backend"/"frontend" based on which side):

> You are an **implementation agent** for task **$ARGUMENTS**. Your job is to write the implementation code.
>
> **Setup:**
> 1. Read `docs/roadmaps/implementation-roadmap.md` and find task **$ARGUMENTS** — understand what it delivers
> 2. Read `docs/product/features.md` for the feature specs referenced by the task
> 3. Read the relevant architecture doc:
>    - Backend: `docs/architecture/api_architecture.md`
>    - Frontend: `docs/architecture/web_architecture.md`
> 4. Read any ADRs referenced in the task description (check `docs/decisions/`)
> 5. If the task involves frontend UI, check `docs/product/features.md` for Figma URLs linked to the relevant feature group. Use the Figma MCP tool (`get_design_context`) with the extracted `fileKey` and `nodeId` to get the design reference. Adapt to existing notesDS components and theme tokens — do not copy raw styles.
>
> **Your deliverable:**
> Implement all [backend/frontend] items from the task's **Delivers** section.
>
> **Backend conventions:**
> - Keep views thin — validate, delegate, serialize
> - Use actions/readers/lookups pattern
> - Annotate all views with `@extend_schema`
> - Raise domain exceptions (not HTTP status codes) in business code
> - Use `select_related`/`prefetch_related` in readers
>
> **Frontend conventions:**
> - Follow data flow: page -> screen hook -> repository -> generated hooks
> - Use layout primitives (`Stack`, `Row`, `Container`, `Section`, `CardShell`) — no raw `<div>` soup
> - Use typography components (`H1`-`H4`, `P`, `Large`, `Small`, `Muted`, `Lead`, `Overline`)
> - Use CVA for multi-variant components
> - Validate inputs with Zod schemas in `domains/*/schemas/`
> - Use `@theme` tokens only — no hardcoded colors
>
> **Rules:**
> - Follow CLAUDE.md conventions strictly
> - Respect the strict unidirectional import rules
> - Do NOT write tests — a separate test agent handles that
> - For backend: run migrations if models were added
> - For frontend: ensure the code compiles without type errors

### Wave 2: Review Agent

After **all Wave 1 agents complete**, launch the review agent:

> You are a **review agent** for task **$ARGUMENTS**. All implementation and test code has been written by other agents. Your job is to review everything before it becomes a PR.
>
> **Setup:**
> 1. Read `docs/roadmaps/implementation-roadmap.md` and find task **$ARGUMENTS**
> 2. Run `git diff main` (or the base branch) to see all changes
> 3. Read the relevant architecture doc(s):
>    - Backend: `docs/architecture/api_architecture.md`
>    - Frontend: `docs/architecture/web_architecture.md`
>
> **Review checklist:**
> 1. **Completeness:** Are all items from the task's **Delivers** section addressed?
> 2. **Architecture compliance:** Do imports follow the strict unidirectional dependency rules in CLAUDE.md?
> 3. **Backend patterns:** Are views thin? Are `@extend_schema` annotations present on all views? Are domain exceptions used (not HTTP)? Are actions/readers/lookups used correctly?
> 4. **Frontend patterns:** Is the data flow correct (page -> hook -> repository -> generated)? Are layout primitives and typography components used (no raw divs/headings)? Are CVA variants used (no ternary Tailwind)? Are Zod schemas used for validation?
> 5. **Tests:** Do tests cover the key deliverables? Do tests follow project conventions?
> 6. **No generated code edits:** Confirm no files in `data/generated/` were manually edited
> 7. **No security issues:** Check for injection, XSS, or other OWASP top 10 vulnerabilities
>
> **Your deliverable:**
> - Fix any issues you find directly — do not just report them
> - Run the test suite to verify tests pass:
>   - Backend: run the relevant Django tests
>   - Frontend: run type checking and any test runner configured
> - After fixing issues and verifying tests pass, update tracking docs:
>   1. Update `docs/roadmaps/implementation-roadmap.md` — change task $ARGUMENTS's `**Status:** pending` to `**Status:** done`
>   2. Update `docs/product/features.md` — mark implemented features as done
>   3. Update `docs/feature-map.md` — add/update entries with all created/modified code paths

## Step 6: Commit and create PR

After the review agent completes:

1. Stage all changes and create a commit with message: `feat: implement task $ARGUMENTS — <task title>`
2. Push the branch to the remote
3. Create a PR using `gh pr create` with:
   - Title: `feat: task $ARGUMENTS — <task title>`
   - Body: summary of what was implemented (from the **Delivers** section), list of files changed, and a test plan
4. Capture the full PR URL returned by `gh pr create`. Update `docs/roadmaps/implementation-roadmap.md` — add `**PR:** <full_url>` (e.g., `https://github.com/org/repo/pull/1`) to the task section (right after the `**Status:**` line), commit and push this update
5. **Verify the PR has no conflicts:** Run `gh pr view <number> --json mergeable,mergeStateStatus --jq '{mergeable, mergeStateStatus}'`. Wait up to 10 seconds for GitHub to compute mergeability (retry once if status is `UNKNOWN`).
   - If `mergeable` is `CONFLICTING`: fetch the latest main, merge it into the branch (`git fetch origin && git merge origin/master`), resolve any conflicts by keeping the branch changes (use `git checkout --ours <file>` for doc/tracking files, and carefully merge code files), commit, and push. Re-check until the PR shows `MERGEABLE`.
   - If `mergeable` is `MERGEABLE`: proceed.
6. Report the PR URL to the user
