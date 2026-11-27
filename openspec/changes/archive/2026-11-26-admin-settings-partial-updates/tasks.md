## 1. Partial update support

- [x] 1.1 Add the `supports_partial_updates` capability flag and a lenient reader to `src/contexts/generalSettings.js`, and strip the flag before normalization so it never enters the settings snapshot.
- [x] 1.2 Update `GeneralSettingsProvider` to read the capability flag from the settings response and to send only the saved section's fields when the API advertises partial updates.
- [x] 1.3 Keep sending the full settings snapshot when the API does not advertise the flag, and re-read the capability from every update response.
- [x] 1.4 Document the partial-update payload contract in `src/features/settings/api.js`.

## 2. Amounts and currency

- [x] 2.1 Add a shared numeric fallback helper in `src/contexts/generalSettings.js` and use it for the minimum reservation amount in the reserve page and the payment instructions page.
- [x] 2.2 Interpolate the deployment currency in the reservation wizard amount labels and add the matching English and Spanish keys.
- [x] 2.3 Fall back to the configured default currency in the bank account sheet empty form and default prop, keeping the currency selector options unchanged.

## 3. Tests

- [x] 3.1 Add a test that an API advertising `supports_partial_updates` receives only the saved section's fields.
- [x] 3.2 Add a test that an API without the flag receives the full settings snapshot, so no other section loses its stored values.
- [x] 3.3 Add a test that the capability flag is not cached, not normalized as a setting and not sent back to the API.
- [x] 3.4 Add a test for the numeric fallback helper and for the currency in the reservation wizard labels.

## 4. Documentation and specs

- [x] 4.1 Document the partial-update contract, the capability flag and the API guarantee in `documentation/features/branding-settings.md`.
- [x] 4.2 Archive the completed `expand-admin-general-settings` change so its requirements reach `openspec/specs/settings/spec.md`.
- [x] 4.3 Confirm the `settings` spec delta describes partial section updates and the legacy fallback.

## 5. Verification

- [x] 5.1 Run `npm run lint` and confirm no new warnings or errors.
- [x] 5.2 Run `npm run test:run` and confirm all tests pass.
- [x] 5.3 Run `npm run build` and confirm the production build succeeds.
- [x] 5.4 Run `npm run verify` and `openspec validate --changes`.
