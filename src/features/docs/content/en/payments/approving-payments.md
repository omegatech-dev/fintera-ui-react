# Approving, rejecting, and undoing payments

> **Admin only.** These actions move money in the contract ledger.

## Approve

When you approve a payment:

1. The payment becomes **paid** and gets today's payment date.
2. A **credit** is written to the contract ledger, reducing the balance.
3. If the amount received is greater than the installment plus interest, the **excess is applied to future installments** (see [Capital repayments and readjustments](/docs/capital-repayments)).
4. If the contract balance reaches zero, the contract is **closed automatically**.

By default the approved amount is the installment plus its interest. You can lower or raise it; any excess above the obligation is treated as a capital repayment. Approving a **capital repayment** payment applies the whole amount to pending installments.

## Reject

Only **submitted** payments can be rejected. Enter a reason so the customer knows what to fix. The customer can upload a new receipt.

## Undo

Undoing an approved payment:

- returns it to **submitted**,
- writes a **reversal** entry to the ledger,
- clears the paid amount and payment date.

Use it to correct an accidental approval, then re-approve or reject.

## Related

- [Capital repayments and readjustments](/docs/capital-repayments)
- [Payment types and statuses](/docs/payment-types-and-statuses)
