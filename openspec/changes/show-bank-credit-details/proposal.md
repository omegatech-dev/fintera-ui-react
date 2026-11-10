## Why

FinteraAPI now stores the bank and credit-application stage reported by a
customer who chooses bank financing. The admin contract details screen has no
way to see or correct that information, so the sales team would have to query
the database to know which bank the customer intends to use.

## What Changes

- Show **Banco** and **Estado del crédito** in the contract details Financial
  tab when the financing modality is bank.
- Allow admins to edit both values in the existing financial form and send them
  through the contract update endpoint.
- Add friendly labels for the four credit stages in Spanish and English, with
  `—` when the value is unknown.
- Keep the existing `max_payment_date` field: it remains the seller-managed
  payment deadline for bank and cash contracts.
- Add tests and locales.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `contracts`: contract details expose and allow editing bank-financing
  information.

## Impact

- `src/features/contracts/components/ContractDetails/tabs/FinancialTab.jsx`
- `src/features/contracts/api.js` (payload passthrough if needed)
- `src/locales/es.json`, `src/locales/en.json`
- Contract tests
- Depends on FinteraAPI `add-bank-credit-details` for the new contract fields.
  The fields are optional, so the UI keeps working before the API is deployed.
