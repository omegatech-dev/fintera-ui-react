## Context

See `proposal.md`. The app already has `AuthContext`/`LocaleContext` patterns,
an `apiClient` wrapper, `AdminRoute`, lazy-loaded routes in `src/Router.jsx`,
and duplicated logo imports in four components. Branding needs a small global
context plus one feature, without disturbing existing capability behavior.

## Goals / Non-Goals

**Goals:**

- Single source of branding state shared by logged-in and public screens.
- Immediate visual feedback after saving (no full reload).
- Zero-risk fallback so the app never depends on the branding endpoint.

**Non-Goals:**

- Editing the PWA manifest (build-time; documented limitation).
- Theme color customization (out of scope; name + logo only).
- Per-user or per-project branding.

## Decisions

### `BrandingContext` in `src/contexts/`

Follows the established context pattern. The provider fetches
`GET /api/v1/branding` on mount, seeds state from a `fintera_branding`
localStorage entry first (so refreshes don't flash the fallback), then updates
state and the cache from the response. Failures keep the cached/default values.
It also sets `document.title` from `app_name`.

### `BrandingLogo` in `src/shared/branding/`

One component replaces four duplicated logo import sites. Props: `variant`
(`light`|`dark`, default `light`), `short` (collapsed-sidebar fallback), plus
standard `img` props. Resolution order: custom logo for the variant → custom
light logo (when dark unset) → bundled asset (`logo-color`/`logo-white`, or
`logo-short` variants). An `onError` handler falls back to the bundled asset if
a stored file 404s.

Relative `/uploads/...` paths are resolved against the API origin. The existing
`getFullImageUrl` prefixes `API_URL` verbatim; branding uses a dedicated
resolver that strips a trailing `/api/v1` so it works with either
configuration.

### Route `/settings/branding` with `AdminRoute`

The existing settings route is user-scoped (`/settings/user/:userId`), so global
branding gets its own top-level route, lazy-loaded and wrapped in `AdminRoute`
like `/projects/create`. Sidebar entries are added to both `Sidebar` and
`SidebarV2` behind `isAdmin`, mirroring the Analytics/Audits pattern.

### Save flow

The form keeps `app_name` plus pending files/removals in local state and calls
the API in sequence (remove → upload → name update), then `refresh()`es the
context and shows a toast. Previews use `URL.createObjectURL` and revoke on
change/unmount. Accepted types mirror the API: PNG/JPEG/WebP, 2 MB.

### Internationalization

All new strings go through `useLocale` with `branding.*` keys added to both
`en.json` and `es.json`, per the repo's i18n rule.

## Risks / Trade-offs

- **Stale cached branding** → localStorage cache is refreshed on every load;
  worst case after an admin edit is one reload for other users.
- **`VITE_API_URL` misconfiguration breaks logo URLs** → the dedicated resolver
  tolerates both origin and `/api/v1` forms; `onError` falls back to bundled
  assets.
- **Uploaded logo unreadable on dark backgrounds** → optional dark variant;
  without it the light logo is reused and the admin can upload a dark one later.
- **Rollback** → remove the route/provider/components; bundled assets and
  locale strings restore the previous behavior with no data migration.

## Migration Plan

Deploy FinteraAPI first (endpoint is additive). This change can ship before or
after it because every consumer falls back to bundled defaults.

## Open Questions

None.
