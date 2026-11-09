# Bank and Cash (Contado) Reservation: Maximum Payment Date

When a customer selects **Bank** or **Cash (contado)** as financing type, the flow differs from **Direct**:

1. **Reservation**: The customer pays a reservation amount (same as other types).
2. **Maximum payment date**: The customer must specify **by when** they will pay the remaining balance (lot price minus reservation). The UI asks for this date and sends it to the backend.

## Frontend (implemented)

- **Reserve page** (`/projects/:id/lots/:lot_id/reserve`): When financing type is **"bank"** or **"cash"**, the form shows a required **Maximum payment date** field (date input). On submit, the value is sent as `contract[max_payment_date]` (YYYY-MM-DD).
- **Contract details modal**: For bank and cash contracts, the overview shows **Balance due by** with the date, and the editable section includes **Maximum payment date** (included in PATCH when present).

## Backend (implemented)

The backend supports the following for bank and cash reservations.

### Payment schedule (bank/cash)

When a contract with financing type **bank** or **cash** is **approved**, the payment schedule is generated as:

1. **Reservation payment**: amount = `reserve_amount`, type = `reservation`, due in 7 days.
2. **Balance payment**: amount = `amount - reserve_amount`, type = `full`, due on `max_payment_date` (description: "Saldo restante").

No down-payment line or installments are created for bank/cash.

### POST Create contract

**Endpoint**: `POST /api/v1/projects/:project_id/lots/:lot_id/contracts`

When `contract[financing_type]` is `"bank"` or `"cash"`:

- **Accept** (required when bank or cash): `contract[max_payment_date]` — string, date in `YYYY-MM-DD` format (e.g. `"2026-06-30"`).
- **Validate**: If financing type is bank or cash, require `max_payment_date` and validate it is a valid future (or today) date.
- **Store**: Persist `max_payment_date` on the contract (date or string column).

### GET Contract(s)

**Endpoints**: e.g. `GET .../contracts/:id`, `GET .../contracts`

- **Return** `max_payment_date` on the contract object when present (ISO date string or YYYY-MM-DD is fine). The UI uses it for display and for the edit form.

### PATCH Update contract

**Endpoint**: `PATCH /api/v1/projects/:project_id/lots/:lot_id/contracts/:id`

- **Accept** (optional): `max_payment_date` in the JSON body — string, date `YYYY-MM-DD`. Allow updating this field for bank or cash contracts when the contract is in an editable state (e.g. pending/submitted/rejected).
- **Validate**: If provided, validate format and that it is a valid date.

## Summary

| Context        | Parameter           | Type   | Required (bank/cash) | Description                                      |
|----------------|---------------------|--------|----------------------|--------------------------------------------------|
| POST contract  | `contract[max_payment_date]` | string (YYYY-MM-DD) | Yes (when bank or cash) | Date by which the customer will pay the balance |
| GET contract   | `max_payment_date`  | string | —                    | Return when present on contract                  |
| PATCH contract | `max_payment_date`  | string | No                   | Allow update for bank/cash contracts             |
