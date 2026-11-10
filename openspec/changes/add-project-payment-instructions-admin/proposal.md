## Why

FinteraAPI stores a project's bank accounts and exposes an admin CRUD API, but
FinteraUI has no way to manage them. Today the only way to add a "Cuentas
bancarias del proyecto" is calling the API by hand, so projects ship with no
accounts and customers cannot pay their reservation.

## What Changes

- Add a dedicated admin page at `/projects/:id/payment-instructions`:
  - project header with back navigation;
  - account list with bank, account type, number, beneficiary and notes;
  - create, edit, delete and reorder (position) actions;
  - loading, empty and retryable error states;
  - a warning when a published project has no accounts.
- Add API wrapper methods to `src/features/projects/api.js`.
- Link the page from the project list card and from the project edit page.
- Validate the form with the same rules as the API (required bank, beneficiary
  and account number; `savings`/`checking`; length caps).
- Add ES/EN locales and page tests.

## Capabilities

### New Capabilities

- `project-payment-instructions-management`: the admin experience for managing
  the bank accounts a project offers to customers.

### Modified Capabilities

None.

## Impact

- `src/Router.jsx`
- `src/features/projects/pages/paymentInstructions/` (new)
- `src/features/projects/components/paymentInstructions/` (new)
- `src/features/projects/api.js`
- `src/features/projects/pages/edit/index.jsx`
- `src/features/projects/components/index.jsx` (list card action)
- `src/locales/es.json`, `src/locales/en.json`
- Depends on FinteraAPI `harden-project-payment-instructions` for documented,
  validated endpoints. The endpoints already exist, so the page works before
  the API change is deployed.
