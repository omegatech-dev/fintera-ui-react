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

## The lot list

Open a project and select **View lots** to see the complete inventory. The list includes:

- **Search** by lot name, address, or registration number.
- Status chips with counts for **All**, **Available**, **Reserved**, **Financed**, and **Fully paid**.
- Sorting by last update, lot name, dimensions, price, or status.
- A summary line with the total count, available count, and the price per lot.

Each lot card shows the dimensions, area, price, status, and the customer who reserved it. **Reserve** starts a reservation for an available lot. For reserved, financed, and paid lots the action opens the lot detail instead.

## Area and price

- **Area** = `length × width`, unless an **override area** is set.
- **Effective price** = the lot's **override price** when present, otherwise the base price calculated from the project.
- **Reserved by** shows the customer; the reservation record shows which staff member created it.

## Why it matters

Statuses are how the system prevents double-selling. Only **available** lots can be reserved, and the reservation flow sets the lot to **reserved** immediately.

## Related

- [Reservations, down payments, and holds](/docs/reservations-and-holds)
- [Contract lifecycle and statuses](/docs/contract-lifecycle)
- [Projects list and project detail](/docs/projects-list-and-detail)
