# Admin settings and brand identity

The organization's application name and logos are managed from an admin-only
Settings area. Personal account settings remain separate.

## Routes

| Route | Purpose |
| --- | --- |
| `/settings` | Redirects to `/settings/general` |
| `/settings/general` | Application name and browser-tab preview |
| `/settings/branding` | Light/dark logos, guidance, and live previews |
| `/settings/user/:userId` | Personal account settings, unchanged |

The `/settings` route tree is wrapped in `AdminRoute`. Admins see a **Settings**
entry in both sidebar variants; sellers and regular users do not, and direct
navigation shows the forbidden page. The personal profile link is labeled
**Account settings** to avoid confusion with the admin area.

## General

`src/features/branding/components/AppNameForm.jsx` updates `app_name` through
`brandingApi.update()` and refreshes `BrandingContext`. The name is previewed in
a browser tab, and an empty/whitespace name is blocked with inline feedback. A
sticky save bar appears only when the name has changed.

## Brand identity

`src/features/branding/components/BrandIdentityForm.jsx` manages pending logo
files and removals. It reuses the existing API:

- `brandingApi.uploadLogo(file, "light" | "dark")`
- `brandingApi.deleteLogo("light" | "dark")`

The section includes:

- `LogoGuidance` — recommended 640 × 160 px (4:1), minimum 320 × 80 px, 2 MB
  limit, PNG/JPEG/WebP, transparent background, horizontal wordmark guidance.
- `LogoUploadCard` — drag-and-drop, click, keyboard upload, preview, file
  metadata, remove/undo, and inline validation.
- `BrandPreview` — light/dark toggle with sidebar, sign-in, and browser-tab
  previews.
- `SettingsSaveBar` (`src/shared/ui/SettingsSaveBar.jsx`) — appears when there
  are unsaved changes and offers Discard.

`src/features/branding/logoRules.js` owns the validation rules. File type and
the 2 MB limit are hard errors. Images below the recommended size or far from a
horizontal aspect ratio (outside roughly 2:1–6:1) show a non-blocking warning so
admins can still save.

Logos that are not configured fall back to the bundled assets. A missing dark
logo falls back to the configured light logo, and the preview notes this.

## Motion and accessibility

Section changes use Framer Motion with `useReducedMotion` support. Upload cards
animate drag-over and preview changes, and the save bar slides in. Inputs have
labels and `aria-describedby`, validation uses `role="alert"`, the save status
uses `aria-live`, and the upload zone is keyboard operable.

## Internationalization

New strings use `settings.admin.*`, `branding.general.*`,
`branding.brandIdentity.*`, `branding.guidance.*`, `branding.preview.*`, and
`branding.upload.*` keys in `src/locales/en.json` and `src/locales/es.json`.

## Tests

- `src/features/branding/logoRules.test.js`
- `src/features/branding/components/AppNameForm.test.jsx`
- `src/features/branding/components/BrandIdentityForm.test.jsx`
- `src/shared/sidebar/Sidebar.test.jsx`
- `src/Router.test.jsx`
- `src/contexts/BrandingContext.test.jsx`
- `src/shared/branding/BrandingLogo.test.jsx`

Run `npm run verify` after changes.
