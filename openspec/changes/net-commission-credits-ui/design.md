## Context

The admin commissions page currently has two disconnected actions: paying a
commission marks the contract's full stored commission as paid, while applying
a credit marks that credit settled without recording a destination or amount.
The shared credit card also calculates "net payable" from period-pending
commissions and global pending credits, which are different scopes. Sellers see
the same credit information read-only.

The backend is implementing transactional credit netting. This UI change
consumes that API; it does not choose allocations, calculate a payout, or change
credit state itself.

## Goals / Non-Goals

**Goals:**

- Present a backend payout preview before an admin confirms payment.
- Show the backend-confirmed gross, applied credit, and net cash after payout.
- Show global remaining credit balance and traceable active applications to
  admins and sellers.
- Remove the manual "Apply credit" action and the browser-calculated net
  payable value.
- Keep the regular gross payout presentation when the backend explicitly says
  netting is disabled.
- Fail closed if the preview cannot be fetched, since the UI cannot safely
  infer whether credits should be netted.

**Non-Goals:**

- Implementing backend netting, persistence, transactionality, migrations, or
  reversal behavior.
- Allowing admins to register cash repayments, write-offs, or manual credit
  applications.
- Changing commission rates, commission eligibility, or the contract ledger.
- Building a complete seller financial statement or payout batch workflow.

## Decisions

1. **The backend owns every monetary calculation.**
   `GET /api/v1/contracts/{guid}/commission/payout-preview` provides the preview.
   `PATCH /api/v1/contracts/{guid}/commission/pay` performs the atomic payout
   and returns the final result. The UI displays those values and never chains
   a payment request with a separate credit-apply request.

   Expected preview fields are `enabled`, `commission`, `available_credit`,
   `applicable`, `net_cash`, and `remaining_credit`. When `enabled` is false,
   show the gross commission and make clear no credit is being applied. A
   preview error blocks confirmation; falling back silently to a gross payout
   could overpay while netting is active.

   The payment response adds a `payout` object containing `commission`,
   `applied_total`, `net_cash`, `remaining_credit`, and the applied
   `applications`. The final response, not the preview, is authoritative if
   balances change between preview and confirmation.

2. **Credits are rendered as a balance and history, not as a manual action.**
   Credit responses provide `applied_amount`, `remaining_amount`, `source`,
   `applications_total`, and active `applications`. Each application identifies
   its destination using `applied_contract_id` and
   `applied_contract_guid`, distinct from the credit's existing
   `contract_id`/`contract_guid` source contract fields. The report provides
   `seller_balance` as a global balance. Remove `netPayable` from the UI rather
   than relabeling a period-minus-global subtraction.

3. **Keep admin and seller presentation on the shared credit component.**
   `CommissionCreditsCard` remains the common presentation point. Admins see
   source and application destinations but no "Apply credit" action. Sellers
   see their own balance and application history without actions. Existing
   pagination remains in place.

4. **Keep the payout confirmation flow localized and explicit.**
   The admin payout dialog includes gross commission, credit applied, and net
   cash. The successful result uses the server response and identifies the
   applied credit allocations where provided. New user-facing copy is added in
   English and Spanish.

5. **Coordinate deployment with the backend contract.**
   The UI requires the preview route even when backend netting is disabled;
   disabled mode is represented by `enabled: false`, not a missing route. Deploy
   the backend route and response fields before or with this UI. The UI does not
   call the legacy `/commissions/credits/:id/apply` action.

Alternatives considered:

- Keeping the existing apply button and subtracting a selected credit in React
  was rejected: it is non-atomic and cannot safely represent partial
  applications or reversals.
- Falling back to a gross payout after preview failure was rejected because
  the UI cannot establish whether netting is enabled.
- Showing `net_pending` as the new balance was rejected because it subtracts
  global credits from period-specific commissions and can become misleading.

## Risks / Trade-offs

- [Backend fields or route differ from this contract] -> Agree on the preview,
  payout, credit, and report response fields before implementation; cover the
  shapes with API/UI tests.
- [Backend is not deployed when the UI is released] -> Deploy backend support
  first or release both together. A failed preview leaves payout confirmation
  disabled rather than guessing.
- [Preview becomes stale before confirmation] -> Treat the final payout
  response as authoritative and display its values after success.
- [Legacy settled credits have no application history] -> Render their
  `source`/status and amounts without fabricating an application destination.
- [Credit list is paginated] -> Show the global balance from the report
  aggregate, not by summing only the currently displayed page.

## Migration Plan

1. Confirm and deploy the backend API shape with netting feature flag disabled
   by default; its preview route must still return `enabled: false`.
2. Deploy this UI. Verify disabled mode still permits ordinary gross payouts,
   and that enabled mode displays the preview and final server result.
3. Enable backend netting when both sides are available and verify credits,
   balances, and allocations in staging before production rollout.
4. Rollback: revert the UI release while leaving the backend flag disabled.
   Do not enable backend netting if the UI is rolled back, because the old UI
   does not display the net cash amount.

## Open Questions

None for the UI proposal. The API fields listed above are the integration
contract and must be reconciled with the backend implementation before the
frontend work begins.
