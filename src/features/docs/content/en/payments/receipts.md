# Uploading and reviewing payment receipts

A **receipt** is the proof of payment a customer uploads for a payment row.

## Uploading

1. Open the payment. Admins can use **Payments** or the contract's payment schedule; sellers use **Collections**.
2. Attach the receipt. Accepted formats are **PDF**, **JPG**, and **PNG**.
3. Optionally enter the **authorization number** and the **payer account name** for bank transfers.
4. Confirm. The payment moves from **pending** to **submitted**.

For a **reservation**, uploading the voucher also moves the contract from **pending** to **submitted** so an admin can review it.

## Reviewing

- **Submitted** means the receipt is waiting for an admin decision.
- **Rejected** means the receipt was not accepted; the customer can upload a new one (the rejection reason is shown).
- **Paid** means an admin approved it and the amount was recorded in the ledger.
- **In review** is the seller-facing label for a receipt that was just uploaded and is still waiting for approval.

## Who can do what

- **Sellers** upload receipts from **Collections**, see the resulting **In review** state, and open the contract documents. They cannot approve or reject.
- **Admins** upload, approve, reject, undo, and download receipts. See [Approving, rejecting, and undoing payments](/docs/approving-payments).

## Related

- [Payment types and statuses](/docs/payment-types-and-statuses)
- [Payments inbox and review queue](/docs/payment-inbox)
- [Collections and receipts](/docs/seller-collections)
