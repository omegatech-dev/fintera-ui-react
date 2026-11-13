# Commissions and payouts

A **commission** is the amount a seller earns when a contract is approved. The rate depends on the project and on the contract's financing type.

## Commission rates

Each project stores three rates:

- **Direct** — direct financing.
- **Bank** — bank financing.
- **Cash** — cash financing.

The commission is calculated when the contract is approved and stored on the contract. Later rate changes only apply to new contracts.

Admins open **Configure rates** from the Commissions page. The rules sheet explains that the rate comes from the project, that the commission is computed on approval, and that per-seller exceptions are not available in this version: the project rates apply to every seller.

## Admin commissions page

Open **Commissions** from the admin menu. The page has:

- **Date range** filters and a **seller** filter.
- Summary cards: commission in the period, amount still to pay, and paid amount, with captions for the average rate and paid count.
- A detail table with contract, seller, client, sale value, commission and rate, status, date, and an action.
- **Export** to download the period as CSV.

For a pending commission, **Pay** asks for confirmation and marks the commission as paid. It writes an audit entry and does **not** change the contract balance. Paid commissions show **View**, which opens a read-only detail dialog.

## Seller commissions

Sellers see **Commissions** in their workspace, read-only:

- Commission this month.
- Pending commission to be paid.
- Paid commission in the period.
- A table with contract, client, sale value, commission and rate, status, and date.

Sellers cannot mark a commission as paid or change rates.

## Related

- [Financing types: direct, bank, and cash](/docs/financing-types)
- [Projects, pricing, and measurement units](/docs/projects-and-pricing)
- [Audit log](/docs/audits)
