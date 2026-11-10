## 1. API wrapper

- [x] 1.1 Add `listPaymentInstructions`, `createPaymentInstruction`, `updatePaymentInstruction` and `deletePaymentInstruction` to `src/features/projects/api.js`.

## 2. Page and route

- [x] 2.1 Add a lazy route `/projects/:id/payment-instructions` in `src/Router.jsx`.
- [x] 2.2 Add `src/features/projects/pages/paymentInstructions/index.jsx` with project loading, account loading, retry and toasts.
- [x] 2.3 Add `src/features/projects/components/paymentInstructions/PaymentInstructionsPanel.jsx` with the list, create/edit form, delete confirmation and reorder controls.
- [x] 2.4 Validate required fields and length caps before submitting.

## 3. Entry points

- [x] 3.1 Add a "Cuentas bancarias" action to the project card in `src/features/projects/components/index.jsx`.
- [x] 3.2 Add a button/link to the page from `src/features/projects/pages/edit/index.jsx`.

## 4. Locales

- [x] 4.1 Add the `paymentInstructions.*` keys to `src/locales/es.json`.
- [x] 4.2 Add the same keys to `src/locales/en.json`.

## 5. Tests

- [x] 5.1 Test the list, empty state and load-error retry.
- [x] 5.2 Test create validation, create success payload, edit and delete.
- [x] 5.3 Test reorder calls and disabled first/last controls.
- [x] 5.4 Test the published-without-accounts warning.

## 6. Verification

- [x] 6.1 `npm run lint` passes.
- [x] 6.2 `npm run test:run` passes.
- [x] 6.3 `npm run build` passes.
- [x] 6.4 `openspec validate --changes` passes.
