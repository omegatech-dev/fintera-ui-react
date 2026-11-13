# Seller Collections

The seller workspace at `/vendedor/cobros` shows what the seller has to collect
next for each active contract, not the contract's total outstanding balance.

## Why the difference matters

A contract can have a balance of `L 1,130,000`, while the next amount to collect
is the reservation or the first installment (`L 50,000`). Showing only the
balance makes sellers think the customer must pay the full contract at once.

## Data source

`GET /api/v1/contracts` now includes, per contract:

- `next_payment`: `{ id, amount, due_date, payment_type, status, description,
  label, has_receipt, overdue_days }`
- flat compatibility fields: `next_payment_id`, `next_payment_amount`,
  `next_payment_date`, `next_payment_type`, `next_payment_label`

The repository computes it with one extra batched query for the page of
contracts (no N+1). The next payment is the earliest payment whose status is
`pending` or `submitted` and that has no receipt. Its label is derived from the
payment type:

| Type | Label |
| --- | --- |
| `reservation` | Reserva |
| `down_payment` | Prima |
| `installment` | Cuota N (from the schedule description) |
| `full` | Total (bank/cash remaining balance) |
| `advance`, `capital_repayment` | Abono a capital |

The API returns the label in Spanish; the UI localizes the label from
`payment_type` and the schedule description so English and Spanish stay in
sync.

## UI behavior

- The **Próximo cobro** column shows the next amount as the primary value, the
  type label and due date below it, and `Saldo: …` as secondary context.
- Rows are sorted by the next due date so urgent collections come first.
- The heading totals the next installments, not the contract balances.
- **Cobrar** opens `RegisterCollectionDialog` directly with the row's
  `next_payment`; it does not fetch the contract detail per row. The dialog uses
  the same `payment.id` for the receipt upload.
- If there is no pending payment, the row shows **Sin cuota pendiente** and the
  collect action is disabled.
- After a successful upload the list reloads so the next installment advances.

## Tests

- API: `internal/models/contract_test.go` (selection and labels),
  `internal/repository/contract_repository_test.go` (batched query),
  `internal/handlers/contract_handler_test.go` (list payload).
- UI: `src/features/seller/pages/index.test.jsx`,
  `src/features/seller/components/RegisterCollectionDialog.jsx`.
