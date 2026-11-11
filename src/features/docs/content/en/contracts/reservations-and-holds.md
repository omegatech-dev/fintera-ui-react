# Reservations, down payments, and holds

A **reservation** locks a lot for a customer before the sale is complete.

## Amounts

- **Reservation amount** — paid to hold the lot. It becomes the first payment on the schedule.
- **Down payment** — an initial payment made after the reservation (direct financing).
- **Payment term** — how many months the financed balance is split into (direct financing).
- **Financed amount** — what remains after the reservation and down payment.

## The reservation hold

When a reservation is created, the lot is held for a limited time. The default hold is **48 hours**, configurable in **Settings → General**.

- When the customer uploads the reservation voucher, the contract moves from **pending** to **submitted**.
- If the hold expires without a voucher, a background job releases the lot and it returns to **available**.
- The remaining time is shown as the contract's **hold expires at**.

## What sellers do

Sellers can create a reservation for a customer: pick an available lot, choose the financing type, enter the amounts and term, and select or create the customer. Sellers can also upload the customer's reservation voucher.

## What admins do

Admins can change the hold duration, approve or reject the reservation, and cancel it. See [Approving, rejecting, and reopening contracts](/docs/approving-contracts).

## Related

- [Contract lifecycle and statuses](/docs/contract-lifecycle)
- [How the payment schedule is generated](/docs/payment-schedule)
