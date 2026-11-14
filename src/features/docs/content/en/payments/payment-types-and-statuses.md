# Payment types and statuses

Every payment row has a **type** and a **status**. The type says what the money is for; the status says where it is in the review process.

## Types

| Type | Meaning |
| --- | --- |
| **Reservation** | Paid to hold the lot. First row on the schedule. |
| **Down payment** | Initial payment after the reservation (direct financing). |
| **Installment** | A monthly payment of the financed balance. |
| **Full** | A single payment of the remaining balance (bank, cash, or no term). |
| **Advance** | An early payment. |
| **Capital repayment** | A payment applied directly to the outstanding principal. |

## Statuses

| Status | Meaning |
| --- | --- |
| **Pending** | Awaiting payment or a receipt. |
| **Submitted** | A receipt was uploaded and it is waiting for review. The payments inbox labels this tab **Pending**. |
| **Paid** | Approved and recorded in the ledger. |
| **Rejected** | The receipt was rejected; the customer can upload a new one. |
| **Readjustment** | The row was adjusted after a capital repayment. |
| **Cancelled** | The installment was cancelled along with the contract; it is not collected. |

The seller workspace also shows **In review** after a receipt is uploaded. It means the same as **submitted**: the admin has not approved it yet.

## Overdue

A payment is **overdue** when it is still **pending** and its due date is in the past. Overdue installments can accrue [moratory interest](/docs/overdue-interest).

## Overpayment

If the amount received is greater than the installment plus interest, the excess is an **overpayment**. The system applies the excess to future installments as a capital repayment.

## Related

- [How the payment schedule is generated](/docs/payment-schedule)
- [Payments inbox and review queue](/docs/payment-inbox)
- [Approving, rejecting, and undoing payments](/docs/approving-payments)
