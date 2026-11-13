# How the payment schedule is generated

The schedule is generated when an admin **approves** a contract. It depends on the financing type and on the due-day settings in **Settings → General**.

## Direct financing

1. **Reservation** — if the reservation amount is greater than zero, it is due the configured **reservation due days** after approval (default `7`).
2. **Down payment** — if the down payment is greater than zero, it is due the configured **down-payment due days** after approval (default `14`), or the **with reservation** value when a reservation also exists (default `21`).
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

1. **Reservation** — due the configured reservation due days after approval, when the amount is greater than zero.
2. **Full balance** — `amount − reservation`, due on the contract's **maximum payment date**.

## Editing the schedule

Admins can open the payment schedule from an approved or closed contract. The modal shows the schedule, the payment rows, and the ledger, and allows registering payments, editing moratory interest, and undoing an approval.

## Related

- [Financing types: direct, bank, and cash](/docs/financing-types)
- [Reservations, down payments, and holds](/docs/reservations-and-holds)
- [Overdue (moratory) interest](/docs/overdue-interest)
