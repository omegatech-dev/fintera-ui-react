# Customers and credit score

A **customer** is a user with the `user` role. Customers sign in to the separate customer portal; staff work with their records from the back office.

## Where customers appear

- **Reservations** — search for an existing customer or create one during the reservation wizard.
- **Users** — admins can search customers, open the user drawer, and edit their profile.
- **Contracts** — the contract detail shows the customer's contact data and credit score.
- **My clients** — sellers see the customers that come from their contracts.

## Customer record

A customer stores full name, email, phone, identity number, RTN, address, and the preferred language. The identity is validated as 13 digits and the RTN as 14 digits when creating or editing a customer.

## Credit score

The **credit score** summarizes payment behavior on a scale from `300` to `850`. It starts at `500` and is recalculated by a background job **every 8 hours** from all of the customer's contracts.

## How points are assigned

For every **paid** payment, the system compares the payment date with the due date:

| Timing | Points |
| --- | --- |
| On time or early | **+5** |
| 1–7 days late | **−2** |
| 8–30 days late | **−5** |
| More than 30 days late | **−10** |

Then, per contract:

| Event | Points |
| --- | --- |
| Contract **cancelled** | **−20** |
| Contract **closed** (fully paid) | **+50** |

The final value is clamped to the `300–850` range.

## Customer documents

Admins can open a customer's drawer and download the balance statement PDF. The contract **Documents** tab also offers the customer record, promise contract, rescission contract, and account statement.

## Related

- [Users and roles](/docs/users-management)
- [Payment types and statuses](/docs/payment-types-and-statuses)
- [Contract lifecycle and statuses](/docs/contract-lifecycle)
