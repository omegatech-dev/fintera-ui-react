## Context

See `proposal.md` for motivation. The admin Settings hub already has a
`General` route that renders `AppNameForm` and a separately bordered
`GeneralSettingsForm`. `settingsApi` already reads and writes a singleton
customer-settings record (`support_whatsapp`, `support_email`,
`reservation_hold_hours`) through `GET/PUT /api/v1/settings`.

The Terms page and login terms modal currently hardcode support contact data.
Shared formatters hardcode `HNL`, `es-HN` and browser-local dates. FinteraWeb
hardcodes a 5,000 HNL minimum reserve, and FinteraAPI hardcodes reservation and
down-payment due windows.

## Goals / Non-Goals

**Goals:**

- Make the General page visually and behaviorally consistent across sections.
- Give admins one place to manage support, reservation policy, legal/contact,
  notification and regional defaults.
- Keep each section independently saveable.
- Consume the settings in Terms, reservation validation and formatting without
  breaking when the API lacks the new fields.

**Non-Goals:**

- Redesigning the whole Settings hub or changing admin-only access.
- Per-project or per-user overrides beyond existing contract currency and user
  locale behavior.
- Migrating historical contracts to new due windows or currency defaults.
- Replacing deployment-level secrets or email-provider configuration.
- Completing the FinteraWeb consumer work in this repository change; the UI
  contract is designed to support it as a follow-up.

## Decisions

### Open sections instead of nested cards

Use a reusable `SettingsSection` with a heading, description, optional top
divider and a save-bar slot. Remove the border/shadow wrapper from
`GeneralSettingsForm`. Both Application name and the new sections use the same
heading scale, input classes and validation pattern. This directly fixes the
double-card layout and avoids duplicating section chrome.

### Per-section forms and partial updates

Each section owns its local draft and calls `settingsApi.update(partial)` on
save. The API is expected to merge the provided fields into the singleton row
instead of replacing the row. This preserves independent saves and avoids
sending unrelated fields. If the API does not yet support partial merges, the
UI can temporarily send the full settings object from context; the context
approach keeps that change localized.

### General settings context with cached fallback

Add `GeneralSettingsProvider` next to `BrandingProvider`. It fetches
`GET /api/v1/settings` on mount, seeds from a localStorage cache, merges
server values over safe defaults, and exposes `settings`, `loading` and
`refresh`. Forms read from the context and refresh it after saving.
Terms and reservation validation consume the same context, so a successful save
is reflected immediately across admin views.

### Settings contract

The UI reads these optional fields, with safe defaults:

| Group | Fields |
| --- | --- |
| Support | `support_whatsapp`, `support_email`, `legal_name`, `legal_tax_id`, `legal_address`, `website`, `terms_effective_date` |
| Reservations | `reservation_hold_hours`, `reservation_min_amount`, `reservation_due_days`, `down_payment_due_days`, `down_payment_due_days_with_reservation` |
| Notifications | `email_notifications_enabled`, `upcoming_reminder_days`, `overdue_reminders_enabled` |
| Regional | `default_currency`, `default_locale`, `timezone` |

Defaults preserve current behavior: 48 hold hours, 5,000 minimum reserve,
7/14/21 due days, 1 upcoming reminder day, reminders and email enabled, HNL,
`es`, and `America/Tegucigalpa`.

### Formatting defaults

Introduce a small formatting configuration module used by
`src/shared/utils/formatters.js`. `GeneralSettingsProvider` updates it when
settings load. `formatCurrency` prefers an explicit record currency, then the
configured default. `formatLargeNumber` and `formatDate` use the configured
locale/timezone. This avoids threading settings through every display component
while keeping per-record overrides intact. A later sweep can replace remaining
hardcoded `HNL` strings with the shared formatter.

### Terms and legal contact

The Terms page and login terms modal render `support_email`,
`support_whatsapp`, `legal_name`, `legal_address`, `website` and
`terms_effective_date` from the settings context. Empty optional values are
omitted; if settings are unavailable, the existing localized copy remains the
fallback.

### API dependency and rollout

This UI change depends on an additive FinteraAPI migration that extends the
singleton settings row and makes `PUT /api/v1/settings` merge provided fields.
The UI must remain usable against an older API: unknown fields are ignored by
the server, and missing fields fall back to defaults in the client. FinteraWeb
can consume the same public response later for reservation minimum, currency
and locale.

## Risks / Trade-offs

- **Partial update semantics differ from the current replace-style handler** →
  Ship the API migration first; keep the client able to send full settings if a
  merge endpoint is unavailable.
- **Concurrent admin edits can overwrite each other** → Per-section partial
  saves reduce the window; the API remains the source of truth on refresh.
- **Currency/locale sweep is broad** → Centralize formatting defaults and update
  high-traffic screens first; record-specific values continue to win.
- **Settings cache can be stale** → Refresh after every save and on startup;
  keep a safe default merge so missing/new fields do not break rendering.
- **Admin notification toggle can conflict with deployment config** →
  Effective email sending remains `deployment env AND admin setting`.
- **Terms content is localized** → Keep labels localized and inject values;
  avoid hardcoding contact data in translation files.

## Migration Plan

1. Deploy the additive FinteraAPI settings fields and merge behavior.
2. Ship the FinteraUI General page refactor and settings context. Existing
   fields continue to work; new fields fall back to defaults if absent.
3. Ship FinteraWeb consumption for minimum reserve, currency/locale and dynamic
   hold copy.
4. Rollback is safe: revert the UI sections and context; existing
   `support_whatsapp`, `support_email` and `reservation_hold_hours` behavior is
   unchanged. New database columns can remain unused.

## Open Questions

None for the UI change. The exact FinteraWeb rollout order can be decided when
that consumer change starts.
