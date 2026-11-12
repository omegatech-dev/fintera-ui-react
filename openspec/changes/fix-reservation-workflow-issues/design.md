## Context

See `proposal.md` for motivation. Relevant current state:

- `src/features/payments/components/PaymentItem.jsx` renders an approve button
  for every `submitted` payment when the user is an admin, in both the desktop
  row (around line 355) and the mobile card (around line 239). It already reads
  `paymentInfo.contract` for currency, lot and applicant data, so the contract
  status is available without a new request.
- `handleApprove` uploads an optional receipt and calls
  `paymentsApi.approve(id, { paid_amount })`; errors are shown with a toast.
- `src/features/contracts/api.js` sends `{ amount }` to the capital repayment
  endpoint, while FinteraAPI binds `capital_repayment_amount`.
- `ApplyPaymentModal` parses the amount with `parseFloat(editableAmount) || 0`,
  blocks negative numbers on change when they parse as numbers, and calls
  `contractsApi.capitalRepayment`.

## Goals / Non-Goals

**Goals:**

- Block the reservation approval action in the UI when the contract is not
  approved, explaining why.
- Defend against out-of-order approvals even if the UI is bypassed.
- Make capital repayments reach the API with the correct payload.
- Keep the existing mobile and desktop presentations consistent.

**Non-Goals:**

- Redesigning the payments list or the approve modal.
- Changing contract approval UI.
- Adding new contract-status filters or report changes.
- Changing capital repayment scheduling rules.

## Decisions

### Pure approval-gate helper in the payments feature

Add `src/features/payments/utils/approval.js` exporting
`reservationApprovalBlocked(payment)`:

```js
const isReservation = (payment?.payment_type || "").toLowerCase() === "reservation";
const contractApproved = (payment?.contract?.status || "").toLowerCase() === "approved";
return isReservation && !contractApproved;
```

`PaymentItem` uses it for both the desktop and mobile approve buttons: disable
the button, add `aria-disabled`, and render a short explanatory line using
`t('payments.reservationRequiresContract')`. `handleApprove` also returns early
when the gate is active, protecting against stale props.

Alternative: hide the button entirely. Rejected because the admin needs to
understand why the action is unavailable; a disabled control plus message is
clearer.

### Surface the server-side error

`handleApprove` already shows `error.message` from `apiClient`; keep that path,
but make the toast copy explicit for the reservation case so a blocked request
still reads as a workflow explanation. No new API call is added.

### Correct capital repayment payload

Change `capitalRepayment` in `src/features/contracts/api.js` to post
`{ capital_repayment_amount: amount }`. This is the documented field and the
only change needed to unblock the flow.

Alternative: adapt in `ApplyPaymentModal`. Rejected because the API contract
belongs in the API module.

### Stricter amount parsing

In `ApplyPaymentModal`, compute the amount with `Number(editableAmount)` and
require `Number.isFinite(amount) && amount > 0`. The change handler keeps
allowing intermediate text while typing but rejects strings that parse to a
negative or non-finite value when they are not the empty string; the submit
guard prevents sending `-`, `NaN` or `0`. Errors keep using the existing
`contracts.capitalPaymentAmountRequired` key, with a new key only if the copy
needs to differ for malformed input.

## Risks / Trade-offs

- [Payment rows loaded without contract data] → In that case `contractApproved`
  is false and reservation approvals are blocked; staff can refresh or open the
  contract, and the API remains the source of truth.
- [Duplicate gate logic drifting between desktop and mobile] → Keep the gate in
  a shared helper and assert it in both render paths with tests.
- [API rejects payload changes for older backends] → The companion API change
  accepts both field names during rollout, so the panel keeps working while
  deploys overlap.
- [Stricter parsing blocks legitimate decimal input] → Validate only on submit;
  typing remains unrestricted.

## Migration Plan

- Deploy the FinteraAPI companion change first so the new payload and guard
  behave as expected; the panel change is backward compatible because the API
  also accepts the previous field name.
- No stored data or routing changes. Rollback is a revert of this change.

## Open Questions

None.
