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
  echo "Running backend tests..."
  BACKEND_OUTPUT=$(cd "$REPO_ROOT/apps/api" && \
    uv run python manage.py test --verbosity=1 2>&1) || true

  if echo "$BACKEND_OUTPUT" | grep -qE "^FAILED|^ERROR"; then
    FAILURES="${FAILURES}

=== Backend test failures ===
${BACKEND_OUTPUT}"
  else
    echo "Backend tests passed."
  fi
fi

# ── Frontend tests ───────────────────────────────────────────────────────────
if [ "$FRONTEND_CHANGED" = true ]; then
  echo "Running frontend type-check..."
  FRONTEND_OUTPUT=$(cd "$REPO_ROOT/apps/web" && \
    npx tsc --noEmit 2>&1) || true

  if [ -n "$FRONTEND_OUTPUT" ]; then
    FAILURES="${FAILURES}

=== Frontend type errors ===
${FRONTEND_OUTPUT}"
  else
    echo "Frontend type-check passed."
  fi
fi

# ── Report ───────────────────────────────────────────────────────────────────
if [ -n "$FAILURES" ]; then
  echo ""
  echo "Tests failed. Fix the following issues before finishing:"
  echo "$FAILURES"
  exit 2
fi

exit 0
