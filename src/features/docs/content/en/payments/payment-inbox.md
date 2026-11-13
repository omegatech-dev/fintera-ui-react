# Payments inbox and review queue

> The **Payments** entry belongs to the admin menu. Sellers see their collection queue in **Collections** instead.

## Summary cards

The payments inbox starts with three cards:

- **Collected this month** — approved payments in the current month.
- **Pending to collect this month** — installments due this month that are not paid yet.
- **Total overdue** — the outstanding overdue amount.

## Tabs

The tabs include their counts and act as filters:

| Tab | What it shows |
| --- | --- |
| **All** | Every payment in the inbox. |
| **Pending** | Payments whose receipt is waiting for review (`submitted`). |
| **Overdue** | Pending installments past their due date. |
| **Approved** | Payments already marked as paid. |

## Search and dates

- **Search** by customer, lot, or concept. Searches shorter than three characters are ignored.
- **Start date** and **end date** limit the list to a date range.
- Click a sortable column header to change the order.

## Rows

Each row shows the customer, concept with project and lot, due date, amount (including accrued interest or overpayment), status, and actions. Overdue rows highlight the due date and amount in red.

For a **submitted** payment, admins see **Approve** and **Reject**. **Approve** is disabled for a reservation whose contract has not been approved yet; the button explains the reason. Everyone sees **Review**, which opens the payment detail, and paid rows expose the receipt download when one exists.

## Related

- [Payment types and statuses](/docs/payment-types-and-statuses)
- [Approving, rejecting, and undoing payments](/docs/approving-payments)
- [Uploading and reviewing payment receipts](/docs/receipts)
