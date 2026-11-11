# Customers and credit score

A **customer** is a user with the `user` role. In this back office you search for existing customers and create new ones when needed.

## Customer record

A customer stores full name, email, phone, identity number, RTN, address, and the preferred language. The identity and RTN are validated when creating a customer.

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

## Why it matters

The score is a quick signal of how reliably a customer pays. A customer who pays on time and completes contracts rises; one who pays late or abandons contracts falls.

## Related

- [Payment types and statuses](/docs/payment-types-and-statuses)
- [Contract lifecycle and statuses](/docs/contract-lifecycle)
