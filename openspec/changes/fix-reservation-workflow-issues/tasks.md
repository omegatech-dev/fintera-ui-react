## 1. Reservation approval gate

- [x] 1.1 Add `src/features/payments/utils/approval.js` with `reservationApprovalBlocked(payment)` and unit tests covering reservation/pending, reservation/submitted, reservation/approved, and non-reservation payments
- [x] 1.2 Apply the helper to the desktop and mobile approve actions in `src/features/payments/components/PaymentItem.jsx`: disable the button, add `aria-disabled`, render the explanatory message, and return early in `handleApprove`; add a component test for the blocked and allowed cases
- [x] 1.3 Add the guard message to `src/locales/es.json` and `src/locales/en.json` (same key) and verify both locales render in the component test
- [x] 1.4 Confirm the API error returned for an out-of-order approval is shown in the existing toast, and add a test for that path

## 2. Capital repayment request

- [x] 2.1 Change `capitalRepayment` in `src/features/contracts/api.js` to post `{ capital_repayment_amount: amount }`; add a unit test asserting the request body field name
- [x] 2.2 Harden amount parsing in `src/features/contracts/components/PaymentSchedule/ApplyPaymentModal.jsx` with `Number.isFinite` and `> 0` guards so empty, `-`, `NaN` and zero never submit; add a test for valid and invalid amounts
- [x] 2.3 Verify the API error message is surfaced in the modal toast when the contract is not approved or the amount is invalid, with a test using a rejected request

## 3. Verification

- [x] 3.1 Run `npm run lint` and fix any reported issue
- [x] 3.2 Run `npm run test:run` and fix any failing test
- [x] 3.3 Run `npm run build` and confirm the production bundle builds
- [x] 3.4 Update `documentation/` only if the approval workflow or capital payment steps are documented there
