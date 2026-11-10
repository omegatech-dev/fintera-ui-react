## 1. Branding state and API

- [x] 1.1 Add `src/features/branding/api.js` wrapping `apiClient` (`get`, `update`, `uploadLogo`, `deleteLogo`).
- [x] 1.2 Add `src/contexts/BrandingContext.jsx` (provider + `useBranding`) with bundled defaults, localStorage cache (`fintera_branding`), fetch-on-mount, `refresh()`, and `document.title` from `app_name`; mount it in `src/main.jsx`.

## 2. Shared logo component

- [x] 2.1 Add `src/shared/branding/BrandingLogo.jsx` (variant/short props, bundled fallback, `onError` fallback) with an asset-URL resolver that tolerates `VITE_API_URL` with or without `/api/v1`.

## 3. Admin branding page

- [x] 3.1 Add `src/features/branding/pages/index.jsx` and `src/features/branding/components/BrandingForm.jsx`: name field, light logo upload/preview/remove, optional dark logo upload/preview/remove, save with toasts.
- [x] 3.2 Register the lazy `/settings/branding` route wrapped in `AdminRoute` in `src/Router.jsx` and add its title/subtitle to `src/hooks/usePageTitle.js`.

## 4. Apply branding across the app

- [x] 4.1 Replace hardcoded logo imports with `BrandingLogo` in `src/shared/sidebar/Sidebar.jsx` and `src/shared/sidebar/SidebarV2.jsx`; add an admin-only Branding nav item to both.
- [x] 4.2 Replace hardcoded logo imports with `BrandingLogo` in `src/features/auth/components/signin/LoginHeader.jsx` and `src/features/auth/pages/signup/index.jsx`.
- [x] 4.3 Use `branding.app_name` for the copyright in `src/features/auth/components/signin/LoginFooter.jsx`.

## 5. Internationalization and tests

- [x] 5.1 Add `branding.*` keys to `src/locales/en.json` and `src/locales/es.json`.
- [x] 5.2 Add tests for `BrandingContext` (fetch success, failure fallback, cache) and `BrandingLogo` (custom vs bundled, dark fallback), and a form test for save/validation.

## 6. Verification

- [x] 6.1 `npm run verify` (lint, tests, build) passes.
- [x] 6.2 `openspec validate --changes` passes.
