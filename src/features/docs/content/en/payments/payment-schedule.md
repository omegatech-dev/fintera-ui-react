# How the payment schedule is generated

The schedule is generated when an admin **approves** a contract. It depends on the financing type.

## Direct financing

1. **Reservation** — if the reservation amount is greater than zero, due **7 days** after approval.
2. **Down payment** — if the down payment is greater than zero, due **14 days** after approval, or **21 days** when there is also a reservation.
3. **Installments** — the remaining balance is `amount − reservation − down payment`.
   - Base installment = `floor(remaining ÷ payment term)`.
   - The **first installment absorbs the remainder**, so `first = remaining − base × (term − 1)`.
   - The first installment is due **1 month** after approval, then one per month.
   - If the term is zero, the remaining balance becomes a single **full** payment due in 1 month.

### Example

Amount `120,000`, reservation `5,000`, down payment `15,000`, term `10`:

- Remaining = `100,000`.
- Base = `floor(100,000 ÷ 10)` = `10,000`.
- First installment = `100,000 − 10,000 × 9` = `10,000`.

If the division does not come out even, only the first installment changes. For example, remaining `100,000` over `7` months: base `14,285`, first `14,290`.

## Bank or cash financing

1. **Reservation** — due **7 days** after approval, when the amount is greater than zero.
2. **Full balance** — `amount − reservation`, due on the contract's **maximum payment date**.

## Related

- [Financing types: direct, bank, and cash](/docs/financing-types)
- [Overdue (moratory) interest](/docs/overdue-interest)
