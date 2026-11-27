## Why

Commission credits currently appear as recoverable balances, but the admin can only mark a whole credit as settled without recording how it was recovered. Meanwhile, paying a commission pays its gross amount and ignores those credits. The React UI must present the backend's transactional netting result clearly and stop offering a misleading manual “Apply credit” action.

## What Changes

- Show a payout preview with gross commission, credits to be applied, and net cash to pay before an admin confirms a commission payout.
- Show the server-confirmed payout breakdown after payment; do not calculate or apply credits in the browser.
- Replace the misleading manual credit settlement action and “net payable” calculation with a seller credit-balance view based on the backend's remaining balance and application details.
- Show the same credit balance and application history read-only to the seller.
- Keep the payout UI compatible while backend netting is disabled; if preview retrieval fails, do not allow an unverified payout.
- Update English and Spanish copy and relevant commission documentation.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `commissions`: preview and display gross, applied credit, remaining credit, and net cash; show seller credit balances and application history; remove the manual apply action.

## Impact

- React commissions API, admin commissions page, seller workspace, commission-credit component and utilities.
- English/Spanish locales, commission tests, and commission feature documentation.
- Depends on backend support for `GET /api/v1/contracts/{guid}/commission/payout-preview`, the payout breakdown returned by `PATCH /api/v1/contracts/{guid}/commission/pay`, and credit/report fields including remaining amount, applications, and seller balance. This change does not implement backend behavior or database changes.
