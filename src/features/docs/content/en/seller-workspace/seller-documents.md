# Seller documents

**Documents** lists the seller's contracts that have documents available: contracts that are active or still under review.

## Summary cards

- **Contracts with documents** — active or in-review contracts.
- **Active contracts** — contracts currently being paid.
- **In review** — contracts waiting for approval.

## Table

Each row shows the contract number, client, project and lot, status, and the **Download statement** action. The action downloads directly; it does not open the contract detail.

On mobile the same action appears on the contract card.

## Downloading the account statement

- **Download statement** requests the customer's account statement PDF from `/api/v1/reports/user_balance_pdf?user_id=...` and starts the browser download.
- The download is direct: the seller stays on **Documents** and sees a confirmation toast when it finishes.
- If the request fails, an error toast explains that the statement could not be downloaded.
- If the contract has no linked customer account, the page shows **This contract has no linked customer account** and does not start a download.

## Search

Search by contract number, client, project, or lot. The list is paginated and shows only the seller's own contracts.

## Related

- [Contract list, detail, and actions](/docs/contract-detail-and-actions)
- [Collections and receipts](/docs/seller-collections)
- [My clients](/docs/seller-clients)
