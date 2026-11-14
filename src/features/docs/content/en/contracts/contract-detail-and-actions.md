# Contract list, detail, and actions

## Contracts list

Open **Contracts** to see every sale and reservation. The page includes:

- A summary line with the total, approved, and pending contract counts.
- Four stat cards: total contracts, pending, approved, and rejected.
- **Search** by customer, contract, or lot; a full GUID also works.
- Status chips with counts for **All**, **Approved**, **Pending**, and **Rejected**.
- A **Filter** button that reveals start and end dates.
- Sortable columns, pagination, and a **Refresh** action.

Each row shows the contract number, customer and identity, lot and project, financing type, balance, status, and the next payment date when available.

The row menu offers **View**. For approved or closed contracts it also offers **Payment schedule** (admins and staff users, not sellers). Admins see **Approve** and **Reject** for eligible contracts, and **Delete** for rejected contracts.

## Contract detail

Select a contract to open its detail page. The header shows the contract number, status chip, lot, project, customer, **Download PDF**, **Register payment** (admins), and an actions menu.

Four cards summarize **total value**, **paid**, **balance** (or credit in favor), and the **next payment**.

The detail has five tabs:

### Overview

- Status banner with the next payment and a short summary.
- **Upcoming payments** with date, amount, and status.
- **Recent activity** from the ledger.
- Side cards for customer contact and credit score, terms, and documents.

### Schedule

The full payment schedule with description, due date, amount, and status. Pending installments are counted in the header.

### Payments

The contract ledger with date, description, amount, running balance, and a totals card (charges, payments, balance). A notes summary is shown on the side.

### Documents

Download the customer record, the promise contract (for direct, bank, or cash financing), the rescission contract when the contract is cancelled or rejected, and the account statement. Receipts uploaded to the payment schedule are listed below.

### Notes

The general contract note. Admins can edit it when the contract has a project and lot; other roles only read it.

## Actions menu

- **View applicant** (admin) — opens the customer in Users.
- **View lot** — opens the project's lot list with the current lot highlighted.
- **Download PDF** — downloads the contract PDF.
- **Send reminder** (admin, not cancelled or closed) — emails the customer a payment reminder.
- **Cancel contract** (admin, approved or signed) — asks for confirmation, marks future installments as cancelled, records the refund, releases the lot, and, if the commission was paid, generates a commission credit.

Sellers only see the read-only actions: view lot, download PDF, and the document downloads.

## Related

- [Contract lifecycle and statuses](/docs/contract-lifecycle)
- [Approving and rejecting contracts](/docs/approving-contracts)
- [Payment types and statuses](/docs/payment-types-and-statuses)
