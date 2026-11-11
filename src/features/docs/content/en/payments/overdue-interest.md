# Overdue (moratory) interest

**Moratory interest** is the extra charge added to an installment that is paid late. A background process recalculates it **every 12 hours**.

## The formula

```
interest = installment amount × (days overdue ÷ 365) × (project interest rate ÷ 100)
```

- `days overdue` is the whole number of days between the due date and today. It must be greater than zero.
- The **project interest rate** is the annual rate stored on the project, as a percentage. It is divided by `100` to become a decimal.
- If the project interest rate is `0`, **no interest is charged**.

## When it applies

The calculation only runs for payments that are:

- type **installment**,
- status **pending** and past their due date,
- on a contract that is **approved** and **active**.

Reservation, down-payment, and full payments do not accrue moratory interest.

## Example

An installment of `5,000` is `10` days late and the project rate is `10%`:

```
5,000 × (10 ÷ 365) × (10 ÷ 100) = 13.70
```

The interest (`13.70`) is added to the payment's interest amount and recorded as a **negative ledger entry**, which increases the debt. When the customer pays, the total due is the installment plus the accumulated interest.

## Editing the charge

Admins can adjust the moratory amount for a specific payment from the payment schedule when the automatic value needs a correction.

## Related

- [Payment schedule](/docs/payment-schedule)
- [Contract lifecycle and statuses](/docs/contract-lifecycle)
