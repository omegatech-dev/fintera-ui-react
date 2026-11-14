## Context

See `proposal.md`. Current UI:

- `contracts/pages/detail/index.jsx` builds the action menu from the contract
  status. "Cancelar" is shown for any non-cancelled/non-closed contract (so it
  appears for `approved`/`signed`), and "Reabrir" is shown for
  cancelled/closed. `handleReopen` calls a no-op API.
- `PaymentSchedule/PaymentRow.jsx` maps statuses (`paid`, `pending`, `submitted`,
  `rejected`, `readjustment`) to tones; there is no `cancelled`.
- The ledger tab renders `ContractLedgerEntry` entries; there is no `refund`
  entry type yet.
- Commissions pages (`commissions/pages`, `seller/pages`) render the report
  rows; there is no credit concept.

## Goals / Non-Goals

**Goals:**

- Wire the cancel action for approved/signed with clear copy.
- Remove the reopen action.
- Represent the cancelled schedule, the refund/write-off and the commission
  credit.

**Non-Goals:**

- Changing the payment approval flow or the PDF generation.

## Decisions

- Cancel action: shown for admins when the status is `pending`, `submitted`,
  `rejected`, `approved` or `signed`; hidden for `cancelled`/`closed`.
- Confirmation copy explains the refund and the credit.
- `cancelled` payment rows render a neutral/danger chip and no action buttons;
  they are excluded from pending/overdue/progress counts.
- Ledger shows `refund` ("Reembolso por cancelación") and `adjustment`
  ("Ajuste por cancelación") rows from the API, without special input.
- Commission credit: `seller_commission_credits` rows appear on the admin and
  seller commissions pages; admins see an "Aplicar crédito" action that marks
  the credit settled.
- Remove `contractsApi.reopen`, `handleReopen` and the reopen menu item.

## Risks / Trade-offs

- [API not deployed yet] → The UI reads the new fields/status defensively; the
  cancel action shows the API error until the backend lands.
- [Ledger wording] → Rely on the API's entry `description`/`entry_type`; the UI
  only adds a label fallback.

## Migration Plan

- No routing/data migration; the UI change is additive and reads new fields
  defensively.
- Rollback: revert the UI change; the API keeps the endpoints.

## Open Questions

None.
