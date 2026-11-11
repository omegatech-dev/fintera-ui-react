# Lots and their statuses

A **lot** is a single sellable piece of a project. Its status tells you whether it can be sold.

## Statuses

| Status | Meaning |
| --- | --- |
| **Available** | Can be reserved or sold. |
| **Reserved** | A contract exists but the sale is not complete yet. |
| **Financed** | The reservation was approved and payments are being collected. |
| **Fully paid** | The balance reached zero and the contract was closed. |

A lot moves from **available → reserved → financed → fully paid**. If a reservation is rejected or cancelled, the lot returns to **available**. Reopening a closed contract returns it to **financed**.

## Area and price

- **Area** = `length × width`, unless an **override area** is set.
- **Effective price** = the lot's **override price** when present, otherwise the base price.
- **Reserved by** shows the customer; **created by** shows the staff member who made the reservation.

## Why it matters

Statuses are how the system prevents double-selling. Only **available** lots can be reserved, and the reservation flow sets the lot to **reserved** immediately.

## Related

- [Reservations, down payments, and holds](/docs/reservations-and-holds)
- [Contract lifecycle and statuses](/docs/contract-lifecycle)
