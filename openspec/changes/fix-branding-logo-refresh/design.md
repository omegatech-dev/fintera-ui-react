# Design: branding writes are visible immediately

## Context

The API's `GET /branding` is public and served with
`Cache-Control: public, max-age=60`. The admin write endpoints
(`PUT /branding`, `POST /branding/logo`, `DELETE /branding/logo`) already
return the full branding payload. The service worker uses `NetworkFirst` for
`/api/v1/`, so the staleness comes from the browser HTTP cache, not the SW
cache (`vite.config.js:28-36`).

## Goals / Non-Goals

- Goal: a logo upload or rename is reflected instantly in the sidebar, the
  upload cards, the live preview, the tab title, and the save bars — even with
  a warm HTTP cache.
- Non-Goal: a square brand icon upload for the favicon/PWA (needs a new API
  field). Unifying the bundled light/dark fallback assets is also out of scope.

## Decisions

### 1. `cache: "no-cache"` on the branding GET

`brandingApi.get()` passes `{ cache: "no-cache" }`; `apiClient.get(endpoint,
options)` already forwards options to `fetch` (`src/lib/apiClient.js:125` and
`:46-53`). Revalidation is safe here: the endpoint is small and public.
This alone fixes reloads within 60 s, but the save flow would still depend on a
second request, so it stays a safety net.

### 2. `applyBranding` merges over the current state

`BrandingProvider` exposes `applyBranding(payload)`:

- Accepts `{ branding: {...} }` (API envelope) or the branding object itself.
- Merges over the current values via `brandingRef` (the callback stays
  `useCallback([])` so `refresh` and the mount effect never loop).
- Whitelists keys derived from `DEFAULT_BRANDING`, so envelope keys such as
  `message` never reach the state, and a partial write response cannot wipe
  `app_name`.
- `null` is explicit: `logo_url: null` clears a logo.
- Persists to `localStorage` (`fintera_branding`) like `refresh` does.

If the GET returns an empty payload, the current branding is preserved instead
of resetting to defaults.

### 3. Write forms reconcile, then apply the write response

`BrandIdentityForm` and `AppNameForm` call `await refresh()` first and then
`applyBranding(response)` for each collected write response. The write
response is the last writer, so a stale GET cannot resurrect the previous
logo/name. Responses are collected in an array so a partial response for the
light upload is not lost when the dark upload resolves last.

### 4. Tab preview uses the bundled favicon

`AppNameForm`'s preview shows `<img src="/pwa-64x64.png">`. A 4:1 wordmark at
16 px is illegible, and the real browser tab uses the bundled favicon, not the
wordmark. `index.html` switches to `/favicon.ico` + `/pwa-64x64.png`
(`favicon.ico` 64×64, `pwa-64x64.png` 64×64 in `public/`).

## Risks / Trade-offs

- `no-cache` adds one revalidation request per provider mount. Acceptable for a
  public, tiny endpoint.
- A stale in-flight GET that started before a write could theoretically land
  after the write response. The write response is applied last in the save
  flow, and the mount GET resolves at app load, long before an admin can save.
- Very old cached favicons may linger per tab; closing and reopening the tab
  once clears it. Not a code issue.

## Migration Plan

No migration. Rollback is reverting the six source files and `index.html`.

## Open Questions

None. The API contract (writes return the full branding) is assumed but the
merge-over-current design tolerates partial responses.
