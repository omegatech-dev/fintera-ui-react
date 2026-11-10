## Why

FinteraUI hardcodes its logo (bundled SVGs in the sidebar, login header, and
signup page) and its name (locale strings, login footer, page title). When the
product is rebranded, an administrator has no way to change it without a code
change and redeploy. FinteraAPI is gaining a public branding endpoint with
admin-only writes; this change consumes it and makes the whole app reflect the
configured branding.

## What Changes

- Add a `BrandingContext` that fetches `GET /api/v1/branding` on startup,
  caches the result in `localStorage`, and falls back to bundled defaults
  ("Fintera" + existing logo assets) when the API is unreachable or returns no
  custom branding.
- Add a reusable `BrandingLogo` component that renders the configured logo
  (light or dark variant) with the bundled assets as fallback, and use it
  everywhere the logo is currently hardcoded: expanded sidebar, collapsed
  sidebar, login header, signup page.
- Replace the hardcoded "Fintera" copyright in the login footer with the
  configured `app_name`, and set the browser tab title from it.
- Add an admin-only Branding page at `/settings/branding` (route guarded by
  `AdminRoute`, sidebar entry visible to admins only) with a simple form:
  application name, light logo upload with preview and remove, optional dark
  logo upload with preview and remove.
- After saving, refresh the context so the change is visible immediately
  without a reload.
- Add `branding.*` keys to `src/locales/en.json` and `src/locales/es.json`.

## Capabilities

### New Capabilities

- `branding`: admin-managed application name and logo applied across the app.

### Modified Capabilities

None. The existing `settings` capability keeps governing the per-user settings
page; global branding is a separate admin concern with its own route.

## Impact

- `src/contexts/`, `src/shared/branding/`, `src/features/branding/`,
  `src/Router.jsx`, `src/shared/sidebar/`, `src/features/auth/`,
  `src/hooks/usePageTitle.js`, `src/locales/`
- Depends on the FinteraAPI branding endpoints; safe to deploy before or after
  because the context always falls back to bundled defaults.
- No changes to authentication, data, or existing capability behavior.
