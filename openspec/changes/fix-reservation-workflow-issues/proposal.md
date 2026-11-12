## Why

The admin panel lets staff approve a reservation payment before the contract is
approved, which contradicts the intended review order and produces an
inconsistent customer status. Separately, the capital repayment action always
fails with "el monto debe ser mayor a 0" because the panel sends the amount
under a field name the API does not read, so staff cannot apply capital
payments at all.

## What Changes

- For reservation payments, disable the approve action until the related
  contract is approved, and show an explanatory message next to it: approving
  the reservation is not possible without accepting the contract first.
- Surface the API error if approval is attempted out of order, instead of a
  generic failure.
- Send the capital repayment amount in the API's documented
  `capital_repayment_amount` field, and keep the existing client-side
  validation for positive amounts.
- Reject malformed amount input (lone minus sign) before submitting.
- Update ES/EN copy for the new guard message and add tests for the approval
  gate and the capital payment request.

**BREAKING**: staff must approve the contract before approving its reservation
payment; the button is disabled with an explanation.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `payments`: reservation payment approval now depends on the contract state
  and exposes a specific block message.
- `contracts`: capital repayments are submitted with the documented API field
  and validated before submission.

## Impact

- `src/features/payments/components/PaymentItem.jsx` and its tests
- `src/features/contracts/api.js` (`capitalRepayment`)
- `src/features/contracts/components/PaymentSchedule/ApplyPaymentModal.jsx`
- `src/locales/es.json` and `src/locales/en.json`
- Depends on FinteraAPI `fix-reservation-workflow-issues` for the server-side
  guard and the capital-repayment payload.
