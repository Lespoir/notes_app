#!/usr/bin/env bash
# Stop hook: run tests for whatever changed, block stop if they fail.
# Exit 0 = tests pass (Claude stops normally)
# Exit 2 = tests fail (Claude is re-prompted to fix failures)

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"

# Detect which areas changed since last commit (staged + unstaged + untracked)
CHANGED=$(git -C "$REPO_ROOT" diff --name-only HEAD 2>/dev/null; \
          git -C "$REPO_ROOT" diff --name-only 2>/dev/null; \
          git -C "$REPO_ROOT" ls-files --others --exclude-standard 2>/dev/null)

BACKEND_CHANGED=false
FRONTEND_CHANGED=false

if echo "$CHANGED" | grep -q "^apps/api/"; then
  BACKEND_CHANGED=true
fi
if echo "$CHANGED" | grep -q "^apps/web/"; then
  FRONTEND_CHANGED=true
fi

# Nothing relevant changed — let Claude stop
if [ "$BACKEND_CHANGED" = false ] && [ "$FRONTEND_CHANGED" = false ]; then
  exit 0
fi

FAILURES=""

# ── Backend tests ────────────────────────────────────────────────────────────
if [ "$BACKEND_CHANGED" = true ]; then
  echo "Running backend tests..." >&2
  BACKEND_OUTPUT=$(cd "$REPO_ROOT/apps/api" && \
    uv run python manage.py test --verbosity=1 2>&1) || true

  if echo "$BACKEND_OUTPUT" | grep -qE "^FAILED|^ERROR"; then
    FAILURES="${FAILURES}

=== Backend test failures ===
${BACKEND_OUTPUT}"
    echo "Backend tests FAILED." >&2
  else
    echo "Backend tests passed." >&2
  fi
fi

# ── Frontend tests ───────────────────────────────────────────────────────────
if [ "$FRONTEND_CHANGED" = true ]; then
  echo "Regenerating API types..." >&2
  if GENERATE_OUTPUT=$(cd "$REPO_ROOT/apps/web" && npm run generate 2>&1); then
    echo "API types up to date." >&2

    echo "Running frontend type-check..." >&2
    FRONTEND_TSC=$(cd "$REPO_ROOT/apps/web" && npx tsc --noEmit 2>&1) || true

    if [ -n "$FRONTEND_TSC" ]; then
      FAILURES="${FAILURES}

=== Frontend type errors ===
${FRONTEND_TSC}"
      echo "Frontend type-check FAILED." >&2
    else
      echo "Frontend type-check passed." >&2
    fi
  else
    echo "⚠ Skipping type-check: could not regenerate API types (is the backend running?)." >&2
  fi

  echo "Running frontend tests..." >&2
  FRONTEND_TESTS=$(cd "$REPO_ROOT/apps/web" && npm test 2>&1) || true

  if echo "$FRONTEND_TESTS" | grep -qE "FAIL|Error:"; then
    FAILURES="${FAILURES}

=== Frontend test failures ===
${FRONTEND_TESTS}"
    echo "Frontend tests FAILED." >&2
  else
    echo "Frontend tests passed." >&2
  fi
fi

# ── Report ───────────────────────────────────────────────────────────────────
if [ -n "$FAILURES" ]; then
  # stdout: detailed failures for Claude to read and fix
  echo "Tests failed. Fix the following issues before finishing:"
  echo "$FAILURES"
  # stderr: brief summary visible in the Claude Code UI
  echo "Tests failed. See details above." >&2
  exit 2
fi

exit 0
