# Capital repayments and readjustments

A **capital repayment** pays down the outstanding principal directly, instead of paying future interest.

## How it is applied

When a capital repayment is approved, the system applies the amount to **pending installments from the end of the schedule backwards**:

- Installments fully covered by the payment are **removed**.
- The last partially covered installment is **reduced**.
- This **shortens the term** instead of prepaying interest.

A **regular payment** only applies the amount that exceeds its own obligation. For example, paying `12,000` on a `10,000` installment leaves `2,000` that is treated as a capital repayment.

## Readjustment

After a capital repayment, the affected rows may show the **readjustment** status. This means the schedule changed because of the repayment.

## Who can do what

- **Admins** can apply a capital repayment to a contract.
- **Sellers** should understand the effect: after a capital payment, future installments may disappear or shrink, and the balance drops immediately.

## Related

- [Approving, rejecting, and undoing payments](/docs/approving-payments)
- [Payment types and statuses](/docs/payment-types-and-statuses)
