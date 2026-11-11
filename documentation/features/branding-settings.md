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

`/settings/general` is presented as open sections separated by dividers, with no
nested cards:

- **Application name** — `src/features/branding/components/AppNameForm.jsx`
  updates `app_name` through `brandingApi.update()` and previews the browser tab.
- **Support and reservations** — support WhatsApp/email, hold hours, minimum
  reservation amount, and reservation/down-payment due windows.
- **Legal and contact** — legal name, tax ID, address, website, and terms
  effective date.
- **Notifications** — email notifications, overdue reminders, and upcoming
  reminder lead time.
- **Regional** — default currency, locale, and timezone.

Each section uses `SettingsSection` and its own save/discard bar. Saving a section
updates only that section's values; `GeneralSettingsProvider` sends a merged
settings snapshot so the rest of the row is preserved even before the API
supports partial merges.

`GeneralSettingsProvider` loads `GET /api/v1/settings` on startup, caches the
result in `fintera_general_settings`, and exposes `useGeneralSettings()`.
Formatting defaults are applied through `src/shared/utils/formatSettings.js`, so
`formatCurrency`, `formatLargeNumber`, and `formatDate` use the configured
currency/locale/timezone while record-specific values still win.

The Terms page and login terms modal render support/legal contact details from
the same settings context.

### Settings contract

| Group | Fields |
| --- | --- |
| Support/legal | `support_whatsapp`, `support_email`, `legal_name`, `legal_tax_id`, `legal_address`, `website`, `terms_effective_date` |
| Reservations | `reservation_hold_hours`, `reservation_min_amount`, `reservation_due_days`, `down_payment_due_days`, `down_payment_due_days_with_reservation` |
| Notifications | `email_notifications_enabled`, `upcoming_reminder_days`, `overdue_reminders_enabled` |
| Regional | `default_currency`, `default_locale`, `timezone` |

Defaults preserve the previous behavior: 48 hold hours, 5,000 minimum reserve,
7/14/21 due days, one upcoming reminder day, notifications enabled, HNL, `es`,
and `America/Tegucigalpa`. Empty contact/legal values fall back to the current
hardcoded details: `support@omegatech.dev`, `+50431848112`, “Omegatech S. de
R.L.” and `https://omegatech.dev/`.

### External dependency

The extended settings require an additive FinteraAPI migration that adds these
columns and makes `PUT /api/v1/settings` merge provided fields. FinteraUI falls
back to defaults if the API does not return the new fields. FinteraWeb is the
follow-up consumer for the reservation minimum, currency/locale formatting, and
dynamic hold copy.

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
`branding.brandIdentity.*`, `branding.supportReservations.*`,
`branding.legal.*`, `branding.notifications.*`, `branding.regional.*`,
`branding.guidance.*`, `branding.preview.*`, and `branding.upload.*` keys in
`src/locales/en.json` and `src/locales/es.json`.

## Tests

- `src/features/branding/logoRules.test.js`
- `src/features/branding/components/AppNameForm.test.jsx`
- `src/features/branding/components/BrandIdentityForm.test.jsx`
- `src/features/settings/components/GeneralSettingsForm.test.jsx`
- `src/contexts/GeneralSettingsContext.test.jsx`
- `src/shared/utils/formatters.test.js`
- `src/features/projects/pages/reserve/reserveRules.test.js`
- `src/shared/modals/LoginTermsModal.test.jsx`
- `src/contexts/__tests__/LocaleContext.test.jsx`
- `src/shared/sidebar/Sidebar.test.jsx`
- `src/Router.test.jsx`
- `src/contexts/BrandingContext.test.jsx`
- `src/shared/branding/BrandingLogo.test.jsx`

Run `npm run verify` after changes.
