# Commissions and payouts

A **commission** is the amount a seller earns when a contract is approved. The rate depends on the project and on the contract's financing type.

## Commission rates

Each project stores three rates:

- **Direct** — direct financing.
- **Bank** — bank financing.
- **Cash** — cash financing.

The commission is calculated when the contract is approved and stored on the contract. Later rate changes only apply to new contracts.

Admins open **Configure rates** from the Commissions page. The rules sheet sets the global default and the unassigned rate, and adds per-seller exceptions. A per-seller exception overrides the project/global rate for that seller. Historical records use the seller exception when present, otherwise the global default.

## Admin commissions page

Open **Commissions** from the admin menu. The page has:

- **Date range** filters and a **seller** filter.
- Summary cards: commission in the period, amount still to pay, and paid amount, with captions for the average rate and paid count.
- A detail table with contract, seller, client, sale value, commission and rate, status, date, and an action.
- **Export** to download the period as CSV.

For a pending commission, **Pay** first previews the gross commission, available credit to apply, net cash to pay, and remaining credit balance. After confirmation, the server applies eligible credits for that seller as part of the payout and returns the final breakdown. The commission is recorded at its gross amount; net cash is the amount actually disbursed. The action writes an audit entry and does **not** change the contract balance. If the preview cannot be loaded, the payout cannot be confirmed. When backend netting is disabled, the preview clearly shows that no credit will be applied. Paid commissions show **View**, which opens a read-only detail dialog.

## Historical clients to validate

The Commissions page has a **Pending validation** tab with the number of historical records waiting for review. It shows pending, validated and rejected totals; filters by seller, status and text; and a table with the client, seller, sale date, price, rate, commission, evidence and status.

From each pending row an admin can:

- **Validate** the record. It leaves the pending list and stays a historical sale; it creates no reservation and blocks no lot.
- **Reject** the record after confirmation.
- **Edit** the client, sale, rate or commission amount before validating.

Sellers can edit their own pending records from **My clients**; validated records are read-only for them.

## Seller commissions

Sellers see **Commissions** in their workspace, read-only:

- Commission this month.
- Pending commission to be paid.
- Paid commission in the period.
- A table with contract, client, sale value, commission and rate, status, and date.

Sellers cannot mark a commission as paid or change rates.

## Commission credit balance and applications

When a previously paid commission is reversed, the resulting **commission credit** appears in the seller's balance. Credits are carried forward across reporting periods and are applied by the server to future commissions for the same seller. The credit list shows the original, applied, and remaining amounts, its source, and the commissions it has been applied to. The admin and seller views are read-only for credits; there is no manual action that marks a credit settled without recording how it was recovered.

If a contract with an applied credit is later cancelled or reassigned, the backend reverses the relevant application and updates the seller's credit balance. The contract's customer balance remains separate from commission credits.

## Related

- [Financing types: direct, bank, and cash](/docs/financing-types)
- [Projects, pricing, and measurement units](/docs/projects-and-pricing)
- [Audit log](/docs/audits)
