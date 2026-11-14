# Contract lifecycle and statuses

A **contract** is the sale of a lot to a customer. Its status follows a fixed lifecycle.

## Statuses

| Status | Meaning |
| --- | --- |
| **Pending** | The reservation exists but is not under review yet. |
| **Submitted** | The reservation voucher was uploaded and it is waiting for admin review. |
| **Approved** | The sale is approved and the payment schedule is active. |
| **Rejected** | An admin rejected it; the lot becomes available. |
| **Cancelled** | The sale was cancelled; the lot becomes available and the paid amount is recorded as a refund. |
| **Closed** | The balance reached zero (fully paid). |

## Allowed transitions

- Pending or rejected → **submitted** (when the reservation voucher is uploaded).
- Pending, submitted, or rejected → **approved** (admin).
- Pending or submitted → **rejected** (admin).
- Pending, submitted, or rejected → **cancelled** (admin).
- Approved or signed → **cancelled** (admin).
- Approved → **closed** automatically when the balance is zero.

Sellers can view the status but cannot change it.

## What "balance" means

The contract balance is the remaining debt. Payments are recorded as credits and reduce it. Interest and capital movements are recorded in the contract **ledger**. When the balance reaches zero on an approved contract, the system closes the contract and marks the lot **fully paid**.

## Related

- [Contract list, detail, and actions](/docs/contract-detail-and-actions)
- [Approving and rejecting contracts](/docs/approving-contracts)
- [Payment types and statuses](/docs/payment-types-and-statuses)
