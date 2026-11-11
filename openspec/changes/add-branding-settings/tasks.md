## 1. Branding state and API

- [x] 1.1 Add `src/features/branding/api.js` wrapping `apiClient` (`get`, `update`, `uploadLogo`, `deleteLogo`).
- [x] 1.2 Add `src/contexts/BrandingContext.jsx` (provider + `useBranding`) with bundled defaults, localStorage cache (`fintera_branding`), fetch-on-mount, `refresh()`, and `document.title` from `app_name`; mount it in `src/main.jsx`.

## 2. Shared logo component

- [x] 2.1 Add `src/shared/branding/BrandingLogo.jsx` (variant/short props, bundled fallback, `onError` fallback) with an asset-URL resolver that tolerates `VITE_API_URL` with or without `/api/v1`.

## 3. Admin Settings hub

- [x] 3.1 Add `src/features/settings/pages/admin/index.jsx` and `AdminSettingsSidebar` with General and Brand identity sections, admin badge, responsive section navigation, and reduced-motion-aware route transitions.
- [x] 3.2 Add `src/features/branding/components/AppNameForm.jsx` and `src/features/branding/pages/general.jsx`: application name, browser-tab preview, inline validation, discard, save with toasts.
- [x] 3.3 Add `src/features/branding/components/BrandIdentityForm.jsx`, `LogoUploadCard`, `LogoGuidance`, and `BrandPreview`: drag-and-drop uploads, metadata, guidance, light/dark previews, save/discard.
- [x] 3.4 Add `src/features/branding/logoRules.js` for accepted types, 2 MB limit, size/format metadata, and non-blocking dimension/ratio warnings.
- [x] 3.5 Register the lazy `/settings` route tree wrapped in `AdminRoute` in `src/Router.jsx`, redirect the index to `/settings/general`, and keep `/settings/branding` working. Add titles/subtitles to `src/hooks/usePageTitle.js`.

## 4. Apply branding across the app

- [x] 4.1 Replace hardcoded logo imports with `BrandingLogo` in `src/shared/sidebar/Sidebar.jsx` and `src/shared/sidebar/SidebarV2.jsx`; add an admin-only Settings nav item to both with active states that exclude `/settings/user/*`.
- [x] 4.2 Replace hardcoded logo imports with `BrandingLogo` in `src/features/auth/components/signin/LoginHeader.jsx` and `src/features/auth/pages/signup/index.jsx`.
- [x] 4.3 Use `branding.app_name` for the copyright in `src/features/auth/components/signin/LoginFooter.jsx`.

## 5. Internationalization and tests

- [x] 5.1 Add `branding.*` and `settings.admin.*` keys to `src/locales/en.json` and `src/locales/es.json`.
- [x] 5.2 Add tests for `BrandingContext` (fetch success, failure fallback, cache), `BrandingLogo` (custom vs bundled, dark fallback), `logoRules` (type/size/dimension rules), `AppNameForm` (save, validation, discard), `BrandIdentityForm` (upload, remove, validation, warnings, discard), sidebar admin-only visibility, and settings route separation.

## 6. Verification

- [x] 6.1 `npm run verify` (lint, tests, build) passes.
- [x] 6.2 `openspec validate --changes` passes.
