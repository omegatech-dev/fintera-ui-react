# Payment Schedule

The payment schedule UI lets staff review a contract's plan, apply and undo
payments, edit mora (late fees), and inspect the ledger and notes.

## Components

| Component | Path |
| --- | --- |
| `PaymentScheduleModal` | `src/features/contracts/components/PaymentScheduleModal.jsx` |
| `PaymentScheduleTab` | `src/features/contracts/components/PaymentScheduleTab.jsx` |
| `LedgerEntriesTab` | `src/features/contracts/components/LedgerEntriesTab.jsx` |
| `ContractNotesTab` | `src/features/contracts/components/ContractNotesTab.jsx` |
| `ContractDetailsModal` | `src/features/contracts/components/ContractDetailsModal.jsx` |

## Behavior

- Tabs: **overview**, **payments**, **ledger**, and **notes**.
- The payments tab renders the schedule with per-installment amounts, paid
  amounts, and interest.
- Totals are derived from the schedule: subtotal, interest, down payment, and
  financing type (cash/bank vs. direct).
- Mora days are calculated from the due date; the mora amount can be edited.
- Payment actions include applying a payment, approving a payment, undoing a
  payment, and registering a capital repayment.
- After a successful payment, the parent contract can be refreshed through the
  `onPaymentSuccess` callback, and list state can be patched optimistically.

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
- Manual QA: [payment schedule QA scenarios](../qa/payment-schedule-scenarios.md)
