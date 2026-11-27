# Tasks: fix-branding-logo-refresh

## 1. Branding state and API

- [x] 1.1 `src/features/branding/api.js` — fetch `GET /api/v1/branding` with `cache: "no-cache"`.
- [x] 1.2 `src/contexts/BrandingContext.jsx` — add `applyBranding(payload)`: normalize `{ branding: {...} }` vs bare object, merge over current state via `brandingRef` (stable `useCallback([])`), whitelist `DEFAULT_BRANDING` keys, preserve `null` clears, persist to `localStorage`, keep current branding on empty payloads; route `refresh()` through it and expose `applyBranding` in the context value.
- [x] 1.3 `src/contexts/branding.js` — add `applyBranding` to the out-of-provider fallback.

## 2. Admin write forms

- [x] 2.1 `src/features/branding/components/BrandIdentityForm.jsx` — collect each write response (`deleteLogo`/`uploadLogo`), then after `await refresh()` call `applyBranding(response)` for each response so the write response is the last writer.
- [x] 2.2 `src/features/branding/components/AppNameForm.jsx` — after `await refresh()` call `applyBranding(response)` so the save bar reflects the saved name.

## 3. Browser tab preview and favicon

- [x] 3.1 `src/features/branding/components/AppNameForm.jsx` — replace the `BrandingLogo` wordmark in the tab preview with the bundled `/pwa-64x64.png` favicon; remove the now-unused `BrandingLogo` import.
- [x] 3.2 `index.html` — replace the SVG favicon with `/favicon.ico` + `/pwa-64x64.png`.

## 4. Tests

- [x] 4.1 Add `src/features/branding/api.test.js`: the GET revalidates with `cache: "no-cache"`; update sends the nested envelope; upload sends multipart with the variant; delete targets the variant.
- [x] 4.2 `src/contexts/BrandingContext.test.jsx` — expose `applyBranding` via the probe; add tests that a write response is applied and persisted and that a partial write keeps `app_name`.
- [x] 4.3 `src/features/branding/components/BrandIdentityForm.test.jsx` — add `applyBranding` to the mocked context and a regression test where the write response is applied even when `refresh` does not update the context.
- [x] 4.4 Add `src/features/branding/components/BrandIdentityForm.integration.test.jsx` — real `BrandingProvider`, mocked `brandingApi` whose GET stays stale: after upload, the preview shows the uploaded logo.
- [x] 4.5 `src/features/branding/components/AppNameForm.test.jsx` — drop the `shared/branding` mock, add `applyBranding` to the mocked context, assert the write response is applied on save, and assert the tab preview uses the bundled favicon.
- [x] 4.6 `src/shared/sidebar/Sidebar.test.jsx` — import `beforeEach`, mock `contexts/branding` with mutable state, and cover the custom-logo and monogram fallback branches.

## 5. Documentation

- [x] 5.1 `documentation/features/branding-settings.md` — document the immediate-apply behavior and `cache: "no-cache"`, correct the preview description (one combined preview, not three), and note the bundled favicon in the tab preview.

## 6. Verification

- [x] 6.1 `npx openspec validate --changes` passes.
- [x] 6.2 `npm run verify` (lint + test:run + build) passes.
