## Why

The contract detail action menu shows "Cancelar" for `approved` and `signed`
contracts, but the API rejects it. It also offers "Reabrir", an action the
product no longer wants. Cancelling a live sale must show the refund and the
cancelled schedule, and a paid commission must become a recoverable credit the
admin can apply.

## What Changes

- Allow the admin to cancel `approved` and `signed` contracts and show the
  consequences in the confirmation (future installments cancelled, paid amount
  refunded in the ledger, lot released, commission credit when applicable).
- Remove the "Reabrir" action and its API call.
- Render `cancelled` schedule rows with a chip and no actions, and exclude them
  from pending/overdue counts.
- Show `refund` and write-off entries in the ledger.
- Surface the commission credit on the seller and admin commissions pages, with
  an admin "apply credit" action.

## Capabilities

### Modified Capabilities

- `contracts`: cancel approved/signed contracts; remove reopen.
- `payments`: display the `cancelled` payment status.
- `commissions`: show and apply the commission credit.

## Impact

- `src/features/contracts/pages/detail/index.jsx`, `src/features/contracts/api.js`
- `src/features/contracts/components/PaymentSchedule/*`
- `src/features/commissions/**`, `src/features/seller/**`
- `src/locales/{en,es}.json`
- `src/features/docs/content/{en,es}/**` (contracts, payments, commissions docs)
