## 1. Settings state and contract

- [x] 1.1 Extend `src/features/settings/api.js` to accept partial settings updates and document the extended settings fields.
- [x] 1.2 Add a `GeneralSettingsProvider` with safe defaults, localStorage cache, `refresh()`, and a `useGeneralSettings` hook; mount it in `src/main.jsx`.
- [x] 1.3 Add a formatting-defaults module and wire `formatCurrency`, `formatLargeNumber` and `formatDate` to use configured currency/locale/timezone while preserving per-record overrides.
- [x] 1.4 Add focused tests for defaults, cache fallback, partial updates and formatting precedence.

## 2. General page UX

- [x] 2.1 Add a reusable `SettingsSection` component with consistent heading, description, divider and save-bar slot.
- [x] 2.2 Refactor `AppNameForm` to use `SettingsSection` and rename its heading to "Application name".
- [x] 2.3 Remove the nested bordered/shadowed card from `GeneralSettingsForm` and restyle it as an open section with the same input, helper-text and validation treatment as Application name.
- [x] 2.4 Restructure `src/features/branding/pages/general.jsx` into Application name, Support and reservations, Legal and contact, Notifications and Regional sections separated by dividers.
- [x] 2.5 Verify visually that no section renders inside a nested card and that each section has its own save/discard bar.

## 3. Support, reservation and legal sections

- [x] 3.1 Add support WhatsApp, support email and reservation hold fields with inline validation and independent save.
- [x] 3.2 Add minimum reservation amount, reservation due days, down-payment due days and down-payment-with-reservation due days; validate ranges and ordering.
- [x] 3.3 Add legal name, tax ID, legal address, website and terms effective date fields with inline validation and independent save.
- [x] 3.4 Add loading states and disabled save buttons while settings are fetched or saving.
- [x] 3.5 Add tests for successful saves, invalid values, discard and section isolation.

## 4. Notification and regional sections

- [x] 4.1 Add email-notifications toggle, overdue-reminders toggle and upcoming-reminder lead-time field with accessible controls.
- [x] 4.2 Add default currency, default locale and timezone fields with validation and independent save.
- [x] 4.3 Show helper copy explaining that deployment-level email settings can still disable sending.
- [x] 4.4 Add tests for toggle persistence, invalid currency/locale/timezone and section isolation.

## 5. Settings consumers

- [x] 5.1 Update the Terms page and login terms modal to render configured support email, WhatsApp/phone, legal name, address, website and effective date with safe fallbacks.
- [x] 5.2 Update the admin reservation flow to enforce and explain the configured minimum reservation amount.
- [x] 5.3 Use the regional defaults in `LocaleContext` only when the user has no saved locale, preserving user and contract overrides.
- [x] 5.4 Replace high-traffic hardcoded `HNL` formatting in payments, contracts/ledger, lots, reserve, dashboard and financing with shared formatters.
- [x] 5.5 Add tests for Terms fallbacks, reservation minimum validation, locale precedence and currency formatting.

## 6. Internationalization and docs

- [x] 6.1 Add English and Spanish keys for all new section titles, labels, helper text, validation messages and toasts.
- [x] 6.2 Update `documentation/features/branding-settings.md` or add a General settings feature doc covering the new sections and settings contract.
- [x] 6.3 Record the FinteraAPI dependency and FinteraWeb follow-up in the documentation.

## 7. Verification

- [x] 7.1 Run `npm run lint` and resolve new warnings or errors.
- [x] 7.2 Run `npm run test:run` and confirm all tests pass.
- [x] 7.3 Run `npm run build` and confirm the production build succeeds.
- [x] 7.4 Run `npm run verify` and `openspec validate --changes`.
