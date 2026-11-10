## Why

Admins need a general configuration area for the customer portal (support
WhatsApp, support email, reservation hold hours), and the customer experience is
being consolidated into FinteraWeb. Today customer (`user` role) accounts can
still sign into the admin app, and there is no UI for the new settings.

## What Changes

- Add a **Soporte y reservas** form to the branding/general settings page with:
  - support WhatsApp (E.164),
  - support email,
  - reservation hold hours (1–720).
- Wire it to `GET/PUT /api/v1/settings` with client-side validation and toasts.
- Block `user`-role accounts from the admin app and show a notice linking to the
  FinteraWeb customer portal (`VITE_CUSTOMER_PORTAL_URL`).
- Document the new environment variable.
- Tests for the settings form and the customer-role guard.

## Capabilities

### New Capabilities

- `admin-general-settings`: admin-managed customer support and hold settings.
- `customer-portal-boundary`: customer accounts are served by FinteraWeb only.

### Modified Capabilities

None.

## Impact

- `src/features/settings/api.js` (new)
- `src/features/settings/components/GeneralSettingsForm.jsx` (new)
- `src/features/branding/pages/index.jsx`
- `src/shared/auth/ProtectedRoute.jsx`
- `src/shared/auth/CustomerPortalNotice.jsx` (new)
- `src/locales/es.json`, `src/locales/en.json`
- `README.md`, `.env` (`VITE_CUSTOMER_PORTAL_URL`)
- Depends on FinteraAPI `add-general-settings-and-tracking`.
