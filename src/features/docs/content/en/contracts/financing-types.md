# Financing types: direct, bank, and cash

Every contract has a **financing type** that decides how the customer pays and how the schedule is generated.

## Direct

The company finances the purchase itself.

- Requires a **down payment** and a **payment term** in months.
- The remaining balance is split into monthly **installments**.
- The project's **interest rate** applies to overdue installments (see [Overdue interest](/docs/overdue-interest)).
- Commission uses the **direct** rate.

## Bank

The customer pays with a bank loan.

- Requires a **maximum payment date**: the date by which the customer expects to pay the remaining balance.
- You can record the **bank name** and the **bank credit status**.
- The schedule is a **reservation** payment plus the remaining balance due by the maximum payment date.
- Commission uses the **bank** rate.

## Cash

The customer pays the balance directly by an agreed date.

- Requires a **maximum payment date**.
- The schedule is a **reservation** payment plus the remaining balance due by that date.
- Commission uses the **cash** rate.

## Bank credit status

When financing is bank, the credit status describes where the loan stands:

| Status | Meaning |
| --- | --- |
| Not started | The customer has not applied yet. |
| Pre-qualified | The bank reviewed the customer's profile. |
| Pre-approved | The bank indicated the loan is likely. |
| Approved | The loan is approved. |

## Related

- [Reservations, down payments, and holds](/docs/reservations-and-holds)
- [How the payment schedule is generated](/docs/payment-schedule)
- [Commissions and payouts](/docs/commissions-and-payouts)
