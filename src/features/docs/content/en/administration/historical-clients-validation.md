# Validating historical clients

A **historical client** is a client and sale that happened before the team started using Fintera. Sellers register these records instead of creating a reservation, so they never go through projects, lots, or the reservation flow.

Records usually start from a **CSV import**, which carries no evidence. After importing, sellers edit each record to attach the **evidence** photo (contract, receipt, or payment proof). The uploaded file is the real document — admins review it in the validation queue before validating the record. Evidence is optional for migrations.

Historical records create **no reservation**, block **no lot**, change **no availability**, and do **not** affect the seller's acceptance score. They do create a commission with the real sale date.

## Where to validate

Open **Commissions** from the admin menu and select the **Historical to validate** tab. The tab label shows the number of pending records.

The tab has four summary cards:

- **Pending** — records waiting for review.
- **Validated** — records approved by an admin.
- **Rejected** — records rejected as invalid.
- **Total** — all historical records matching the current seller/search filter.

## Historical clients in Users and reservations

Every historical client is linked to a real customer account (`role = user`). This means:

- The client appears in **Users → Clients** with a **HISTÓRICO** chip.
- The **Históricos** filter shows only clients created from migrated sales.
- The client can be found and selected in the reservation wizard as an existing client.
- If the historical record had no email, the account uses a non-deliverable placeholder. The UI shows **No email** and hides **Invite / Resend confirmation** until an admin adds a real email from the user edit form.

The account is created when the historical record is saved or imported. Existing records are linked by the deployment backfill. Validation does not create the account and does not change it.

## Filters

- **Search** matches the client name, identity, phone, or project.
- **Seller** limits the queue to one seller.
- **Status** switches between all, pending, validated, and rejected records.

The summary cards and the table follow the same seller and search filters.

## Table columns

| Column | What it shows |
| --- | --- |
| **Client** | Client name and the seller who created the record. |
| **Sale date** | The real date of the sale, not the upload date. |
| **Sale price** | The price recorded by the seller. |
| **Rate** | The commission rate stored on the record. |
| **Commission** | The commission amount stored on the record. |
| **Evidence** | A **View evidence** action that opens the attached contract, receipt, or payment proof, when present. Records without evidence show —. |
| **Status** | Pending, validated, or rejected. |
| **Actions** | Edit, validate, or reject. |

## Actions

### View evidence

When a row has evidence, the **Evidence** column shows a **View evidence** button. It opens a side panel with the file the seller uploaded:

- Images are shown inline; PDFs open in an embedded viewer.
- Old records that stored an external link open that link instead.
- Records without evidence show a **No evidence** empty state.
- **Download** saves the file as `respaldo-<id>.<extension>`.

Review the evidence here before deciding to **Validate** or **Reject** the record. Sellers can also open their own evidence from the historical client edit page.

### Edit

**Edit** opens the historical client form with the stored values. Use it to correct the client data, sale data, rate, or commission amount **before** validating.

- Sellers can edit their own pending records from **My clients**.
- Admins can edit any pending record.
- Validated records are read-only for sellers.

### Validate

**Validate** marks the record as **validated** and removes it from the pending queue after the refresh.

Validation does **not**:

- Create a reservation.
- Block or reserve a lot.
- Change lot availability.
- Recalculate the commission.
- Change the seller's acceptance score.

The record stays a historical sale. Its commission remains included in the period KPIs with the real sale date.

### Reject

**Reject** asks for confirmation and marks the record as **rejected**. It leaves the pending queue and stays a historical sale. Rejected records are excluded from commission totals.

## How the historical commission rate is chosen

When a seller registers a historical sale, Fintera resolves the rate as:

1. The **per-seller exception**, when the admin configured one.
2. Otherwise, the **global default rate**.

The form preloads that effective rate and lets the seller change it for that record. The rate and the amount stay consistent:

- Changing the **rate** or the **sale price** recalculates the **amount**.
- Changing the **amount** recalculates the effective **rate**.
- Correcting the commission after creation is possible through **Edit** while the record is pending.

Validation does not recompute the commission. If the rate or amount is wrong, fix it with **Edit** before validating.

## Permissions and audit

- Only admins can access the validation queue and validate or reject records.
- Sellers only see their own historical records.
- Creating, editing, validating, and rejecting a record writes an audit entry with the actor, date, and record. See [Audit log](/docs/audits).

## Related

- [Commissions and payouts](/docs/commissions-and-payouts)
- [My clients](/docs/seller-clients)
- [Audit log](/docs/audits)
