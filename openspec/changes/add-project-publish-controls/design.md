## Context

See `proposal.md` — Why. `src/features/projects/components/index.jsx` renders
the card from the admin project list response. `pages/edit/index.jsx` already
owns the project form and final action row. `api.js` wraps `apiClient`. The API
will expose `POST /projects/:id/publish`, `POST /projects/:id/unpublish`, and a
`cover_photo_url` field.

## Goals / Non-Goals

**Goals:**

- Make visibility state obvious on every card.
- Let admins toggle visibility from the card and edit page.
- Show the portal link and cover image without extra per-card requests.
- Keep the existing card layout and permissions.

**Non-Goals:**

- Changing the card grid, filters, or pagination.
- Adding image upload to the card.
- Reworking the public portal app.

## Decisions

### Card owns its visibility toggle

The card receives `project`, `user`, `onDeleted`. Add `onVisibilityChanged`
callback from the list page so the card can optimistically update and the list
can refetch when needed. Keep the toggle inside the admin action row next to the
existing edit/payment buttons.

### Edit page toggle uses the same API helpers

The edit page already has `is_published` in the fetched project. Add it to state
and render a publish/unpublish button. It calls the same helpers as the card and
updates local state from the response.

### Public link from configuration

Add `VITE_PUBLIC_PORTAL_URL` to `config.js`. The link is
`${VITE_PUBLIC_PORTAL_URL}/projects/${guid}`. When the variable is empty, render
the GUID without an anchor instead of a broken link.

### Cover image with fallback

Use `cover_photo_url` through the existing `mediaUrl` helper. If it is missing,
keep the current gradient header. No new dependency is needed.

## Risks / Trade-offs

- **API not deployed yet** → the new fields and routes are absent; the UI shows
  unpublished/placeholder state and the toggles would fail. The UI will hide the
  controls when the API does not return `is_published`, and the deploy order
  should be API first.
- **Optimistic state** → a failed toggle should roll back and show a toast.
  Implement the request first, then update state from the response.
- **Public URL configuration** → deployments without `VITE_PUBLIC_PORTAL_URL`
  intentionally degrade to the GUID copy action.

## Migration Plan

1. Deploy the API change.
2. Set `VITE_PUBLIC_PORTAL_URL` in the UI environment.
3. Deploy the UI change.
4. Rollback is a UI revert; no data migration is required.
