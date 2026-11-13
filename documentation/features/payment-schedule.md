# Payment Schedule

The payment schedule UI lets staff review a contract's plan, apply and undo
payments, edit mora (late fees), and inspect the ledger and notes.

## Components

| Component | Path |
| --- | --- |
| `PaymentSchedulePanel` | `src/features/contracts/components/PaymentSchedulePanel.jsx` |
| `PaymentScheduleModal` | `src/features/contracts/components/PaymentScheduleModal.jsx` |
| `PaymentScheduleTab` | `src/features/contracts/components/PaymentScheduleTab.jsx` |
| `LedgerEntriesTab` | `src/features/contracts/components/LedgerEntriesTab.jsx` |
| `ContractNotesTab` | `src/features/contracts/components/ContractNotesTab.jsx` |
| `ContractDetailsModal` | `src/features/contracts/components/ContractDetailsModal.jsx` |

## Behavior

- `PaymentSchedulePanel` owns the payment operations and is shared by the
  contract detail schedule tab and the payments tab inside
  `PaymentScheduleModal`.
- Tabs: **overview**, **payments**, **ledger**, and **notes**.
- The payments tab renders the schedule with per-installment amounts, paid
  amounts, and interest.
- Totals are derived from the schedule: subtotal, interest, down payment, and
  financing type (cash/bank vs. direct).
- Mora days are calculated from the due date; the mora amount can be edited.
- Row hierarchy: **Apply payment** is the primary row action. Edit mora and undo
  live in the row overflow menu; undo always asks for confirmation. Capital
  repayment sits in the schedule footer as a secondary action.
- The detail header has one primary action. Pending or submitted contracts show
  **Approve** as the primary action for admins; approved contracts show
  **Register payment** as primary. Register payment stays available as a
  secondary action while approval is pending. Reject, cancel, reopen and
  reminders live in the overflow menu.
- Sellers, closed, cancelled, and rejected contracts are read-only: receipts can
  still be reviewed, but no payment, mora or capital actions are shown.
- After a successful payment, mora edit or undo, the parent contract can be
  refreshed through `onChanged`; `PaymentScheduleModal` keeps its existing
  `onPaymentSuccess` callback.
- The contract detail header links to the lot, and the summary rail includes a
  lot card with project, area, dimensions, unit, price, status and address.
  **View lot** opens `LotDetailsModal` from the contract without leaving the page.

## API

Contract and payment calls live in `src/features/contracts/api.js`
(`contractsApi`), for example:

- `getDetails(projectId, lotId, contractId)`
- `approve`, `reject`, `cancel`, `reopen`
- `approvePayment(paymentId, data)`
- `undoPayment(paymentId)`
- `capitalRepayment(projectId, lotId, contractId, amount)`

## Tests and QA

- Unit test: `src/features/contracts/components/PaymentScheduleModal.test.jsx`
- Unit test: `src/features/contracts/components/PaymentSchedulePanel.test.jsx`
- Manual QA: [payment schedule QA scenarios](../qa/payment-schedule-scenarios.md)
