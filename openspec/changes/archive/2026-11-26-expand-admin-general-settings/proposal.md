## Why

The General settings page currently nests the "Support and reservations" form in
its own bordered card, so it does not match the Application name section. At the
same time, several deployment-wide values are still hardcoded across FinteraUI,
FinteraAPI and FinteraWeb: legal/contact details in Terms, the minimum reservation
amount, payment due windows, reminder rules, and currency/locale defaults. Admins
have no single place to manage them.

## What Changes

- Refactor `/settings/general` into consistent, open sections with the same
  heading, input, validation and save/discard UX: Application name, Support and
  reservations, Legal and contact, Notifications, and Regional.
- Remove the nested card around "Support and reservations".
- Add a `GeneralSettingsProvider` that loads public general settings once and
  shares them across the admin app, with a cached fallback.
- Use partial `PUT /api/v1/settings` requests so each section saves independently
  without overwriting other sections.
- Surface new settings in the UI:
  - legal name, tax ID, address, website and terms effective date;
  - reservation minimum amount and payment due windows;
  - email/overdue reminder toggles and upcoming reminder lead time;
  - default currency, locale and timezone.
- Consume the settings in Terms, reservation validation and shared currency/date
  formatting. Keep the customer portal (FinteraWeb) as a follow-up consumer.
- **Dependency:** requires the additive FinteraAPI general-settings expansion
  described in the design. UI defaults keep the app working if the new fields are
  absent.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `settings`: adds the admin-managed general settings sections, independent
  section saves, and consumption of those settings by Terms, reservation
  validation and formatting.

## Impact

- `src/features/settings/`, `src/features/branding/pages/general.jsx`
- `src/contexts/` (new general settings provider)
- `src/shared/utils/formatters.js`, `src/contexts/LocaleContext.jsx`
- `src/features/auth/` login terms modal and `src/features/settings/pages/terms&condition/`
- `src/locales/en.json`, `src/locales/es.json`
- `src/main.jsx`, `src/routes.jsx`
- Depends on FinteraAPI extended `general_settings` fields and partial updates.
- Follow-up consumer work in FinteraWeb for reservation minimum, currency/locale
  and dynamic hold copy.
