# ADR-003: Auto-Save Strategy

## Status

Accepted

## Context

Feature 4.3 specifies auto-save with no manual save button. When the user edits a note's title, content, or category, changes must persist automatically. We need to decide on the mechanism that triggers save operations and how the frontend communicates changes to the backend.

Key requirements:
- No explicit "Save" button — saving is invisible to the user
- Changes must not be lost if the user navigates away or closes the tab
- The solution should not overwhelm the backend with excessive requests
- Last-edited timestamp (feature 4.4) should update as the user types

## Options

### Option A: Debounced PATCH requests (client-side debounce ~1s)

The frontend debounces input changes and sends a PATCH request after the user stops typing for ~1 second. Uses standard REST endpoints.

**Pros:**
- Simple to implement — debounce utility + existing REST mutation
- Works with standard HTTP infrastructure (no WebSocket server needed)
- Easy to reason about: one PATCH per pause in typing
- Plays well with React Query's mutation and cache invalidation model
- Graceful degradation — if a request fails, retry on next change

**Cons:**
- Changes are lost if the user closes the tab during the debounce window (mitigable with `beforeunload`)
- Multiple rapid edits produce multiple requests (though debounce limits this)
- Slightly delayed persistence (~1s after last keystroke)

### Option B: WebSocket / real-time sync

Maintain a persistent WebSocket connection. Send changes as they happen via the socket; the server persists and acknowledges.

**Pros:**
- Near-instant persistence — changes are sent immediately
- Enables real-time collaboration if scope expands to multi-user editing
- Server can push updates back (e.g., conflict resolution)

**Cons:**
- Significant infrastructure complexity — requires Django Channels, ASGI server, Redis for channel layer
- Overkill for a single-user notes app with no collaboration requirement
- More complex error handling (reconnection logic, message ordering)
- Harder to test and debug than simple HTTP requests
- Breaks the REST-only API contract the architecture is built around

### Option C: Periodic auto-save (fixed interval)

Save on a fixed timer (e.g., every 5-10 seconds) regardless of whether the user is typing.

**Pros:**
- Predictable server load — fixed request rate
- Simple timer-based implementation

**Cons:**
- Unnecessary requests when the user isn't editing (wastes bandwidth)
- Changes made within the last interval are lost on tab close
- Longer intervals mean more potential data loss; shorter intervals waste requests
- Less responsive than debounce — the user may wait up to the full interval before persistence
- Feels less "instant" than debounce-based approach

## Decision

**Option A: Debounced PATCH requests with ~1 second client-side debounce.**

This is the simplest approach that meets the requirements. A debounce utility in the screen hook watches for changes to title, content, or category, and fires a `PATCH /api/v1/notes/{id}/` after the user stops typing for ~1 second. It uses the same REST infrastructure as every other endpoint — no WebSockets, no new server dependencies. The ~1s delay is imperceptible to users and keeps request volume low.

To guard against data loss on tab close, the editor will also flush any pending changes via a `beforeunload` event handler (using `navigator.sendBeacon` or a synchronous XHR as a last resort).

## Consequences

- **Frontend implementation:** The note editor screen hook manages a debounced mutation. Use a `useDebouncedCallback` (or similar) wrapping the update repository method. Flush on `beforeunload`.
- **Backend contract:** The `PATCH /api/v1/notes/{id}/` endpoint must accept partial updates (any subset of `title`, `content`, `category`). The `updated_at` timestamp is set server-side on every PATCH.
- **Optimistic UI:** The last-edited timestamp (feature 4.4) updates immediately on the client for responsiveness, then reconciles with the server response.
- **Error handling:** If a PATCH fails, the next edit triggers a retry. No complex retry queue — the debounce naturally retries on the next keystroke pause.
- **No offline support:** Changes made while offline are lost. This is acceptable for the MVP scope.
