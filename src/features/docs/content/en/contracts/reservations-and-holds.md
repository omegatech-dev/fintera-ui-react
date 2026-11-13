# Reservations, down payments, and holds

A **reservation** locks a lot for a customer before the sale is complete.

## Amounts

- **Reservation amount** — paid to hold the lot. It becomes the first payment on the schedule. The minimum amount is configured in **Settings → General**.
- **Down payment** — an initial payment made after the reservation (direct financing).
- **Payment term** — how many months the financed balance is split into (direct financing).
- **Financed amount** — what remains after the reservation and down payment.

## The reservation wizard

Sellers and admins start a reservation from a lot or from **New reservation** on the seller's **My day**.

1. **Client** — search for an existing customer or create a new one with name, phone, identity, RTN, and email.
2. **Financing plan** — choose direct, bank, or cash; enter the payment term, maximum payment date, reservation amount, down payment, and notes as required.
3. **Confirm** — review the summary and attach any documents.

When it is submitted, the lot moves to **reserved** and the contract starts in **pending** status.

## The reservation hold

When a reservation is created, the lot is held for a limited time. The default hold is **48 hours**, configurable in **Settings → General** with a valid range of `1` to `720` hours.

- When the customer uploads the reservation voucher, the contract moves from **pending** to **submitted**.
- If the hold expires without a voucher, a background job releases the lot and it returns to **available**.
- The remaining time is shown as the contract's **hold expires at**.

## Due dates

The reservation and down-payment due dates are configured in settings:

- **Reservation due days** — default `7` days after approval.
- **Down-payment due days** — default `14` days.
- **Down-payment due days with reservation** — default `21` days; it must not be earlier than the plain down-payment due date.

## What sellers do

Sellers create reservations for their customers, upload the reservation voucher, and follow the contract. They cannot approve, reject, cancel, or reopen a contract.

## What admins do

Admins can change the hold and due dates, approve or reject the reservation, cancel it, and reopen it when needed. See [Approving, rejecting, and reopening contracts](/docs/approving-contracts).

## Related

- [Contract lifecycle and statuses](/docs/contract-lifecycle)
- [How the payment schedule is generated](/docs/payment-schedule)
- [General settings and branding](/docs/settings-and-branding)
