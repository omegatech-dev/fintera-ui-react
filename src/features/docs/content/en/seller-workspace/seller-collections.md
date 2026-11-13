# Collections and receipts

**Collections** is the seller's collection queue. It lists the seller's active contracts that still have a balance.

## Summary cards

- **Due this month** — installments due in the current month.
- **Overdue** — outstanding overdue balance.
- **Collected this month** — approved payments in the current month.

## Table

Each row shows the client and contract, project and lot, outstanding amount, contract status, and the **Collect** action. The contract link opens the contract's **Payments** tab.

Search by client, project, or lot. The header shows the number of contracts with a balance and the total pending amount.

## Registering a collection

1. Select **Collect** on a row.
2. The system opens the contract and finds the earliest installment that is **pending**, **overdue**, or **submitted** and has no receipt.
3. Review the client, contract, installment, due date, amount, and current balance.
4. Upload the receipt (image or PDF).
5. Confirm **Register collection**.

The dialog explains that the payment goes to review and that the balance changes only after an admin approves it.

After the receipt is sent, the row shows **Receipt sent** and the status chip shows **In review**. The seller does not approve the payment; an admin does that from **Payments**.

If the contract has no pending installment to collect, the dialog shows a warning and the submit action stays disabled.

## Who can do what

- **Sellers** upload the receipt for their own contracts. They cannot approve, reject, or undo a payment.
- **Admins** approve or reject the payment in the payments inbox.

## Related

- [Uploading and reviewing payment receipts](/docs/receipts)
- [Payments inbox and review queue](/docs/payment-inbox)
- [Payment types and statuses](/docs/payment-types-and-statuses)
