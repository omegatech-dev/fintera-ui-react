# Fix: branding writes are visible immediately

## Why

The admin *does* upload the logo and the API *does* save it, but the frontend
keeps the stale copy of `GET /branding` and repaints the bundled logo:

```
Admin uploads logo
  → POST /branding/logo returns the fresh branding   ← discarded by the form
  → form calls refresh()
  → brandingApi.get() uses the default HTTP cache mode
  → API serves GET with Cache-Control: public, max-age=60
  → the response still has the previous (or null) logo_url
  → context loses the logo → sidebar shows the monogram
  → upload card preview falls back to the bundled logo
  → AppNameForm's save bar stays visible because app_name is stale
```

The `Cache-Control` header is correct for a public GET, and the write
responses already return the full branding. The bug is on the client: it throws
away the authoritative write response and trusts a cached read.

## What Changes

- `GET /api/v1/branding` is fetched with `cache: "no-cache"` so a warm 60 s
  HTTP cache cannot hide a just-uploaded logo.
- `BrandingProvider` exposes `applyBranding(payload)`, which merges a branding
  payload over the current values (with a ref, keeping the callback stable)
  and persists it. Partial write responses cannot wipe `app_name`, and unknown
  envelope keys such as `message` are ignored.
- The admin write forms (`BrandIdentityForm`, `AppNameForm`) reconcile with
  `refresh()` first, then apply the write response, so a stale GET can never
  restore the previous logo or name.
- The General settings tab preview shows the bundled `/pwa-64x64.png` favicon:
  the real browser icon is not derived from the 4:1 wordmark.
- `index.html` uses the bundled `favicon.ico` / `pwa-64x64.png` instead of the
  4:1 wordmark SVG.

## Capabilities

### Modified
- `branding`: the brand identity preview no longer includes the browser tab
  (the browser icon is the bundled favicon, not the wordmark).

### Added
- `branding`: branding writes are visible immediately; browser tab preview uses
  the bundled favicon.

## Impact

- Affected specs: `branding` (client-side admin behavior; no API changes).
- Affected code:
  - `src/features/branding/api.js` (GET cache mode)
  - `src/contexts/BrandingContext.jsx`, `src/contexts/branding.js`
  - `src/features/branding/components/BrandIdentityForm.jsx`, `AppNameForm.jsx`
  - `index.html`
- Tests: new `api.test.js`, new `BrandIdentityForm.integration.test.jsx`, and
  updates to the branding context/form/sidebar suites.
- Rollback: revert the source files; no migration, no API contract change.
