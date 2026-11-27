## Why

The General settings page saves each section independently, but the admin sends
the full settings snapshot on every save. That works only while the API
replaces the whole row: the snapshot carries the values of the other sections,
so they survive by coincidence, not by contract.

Once the API supports per-field updates, the admin can send only the fields
of the section being saved. That removes the risk of a save overwriting a
concurrent edit made by another admin, and it matches what the
`expand-admin-general-settings` change already promised ("Use partial
`PUT /api/v1/settings` requests so each section saves independently").

The API has to opt in explicitly: the admin cannot infer from the response
shape that the server merges, because the extended fields prove only that the
columns landed. A wrong guess sends a partial payload to a replace-style
handler and erases the other sections.

## What Changes

- Read the API capability flag `supports_partial_updates` from
  `GET /api/v1/settings`.
- Send only the saved section's fields in `PUT /api/v1/settings` when the API
  advertises partial updates; send the full snapshot otherwise.
- Keep the capability flag out of the settings snapshot, the localStorage
  cache and the request payload.
- Resolve the configured minimum reservation amount through a shared numeric
  fallback helper instead of `Number(x) || 0`.
- Show the deployment currency in the reservation wizard labels.
- Fall back to the configured default currency when the bank account sheet has
  no explicit currency.
- Archive the completed `expand-admin-general-settings` change so its
  requirements reach the `settings` spec.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `settings`: General settings sections save only their own fields when the
  API advertises partial update support.

## Impact

- `src/contexts/generalSettings.js`
- `src/contexts/GeneralSettingsContext.jsx`
- `src/features/settings/api.js`
- `src/features/projects/pages/reserve/`
- `src/features/projects/pages/paymentInstructions/index.jsx`
- `src/features/projects/components/BankAccountSheet.jsx`
- `src/locales/en.json`, `src/locales/es.json`
- `documentation/features/branding-settings.md`
- Requires the API to expose `supports_partial_updates` in the settings
  response and to merge provided fields on `PUT /api/v1/settings`.
