## 1. Locales

- [x] 1.1 Add `contractDetailsModal.bankName`, `bankNamePlaceholder`, `bankCreditStatus` and the four `bankCreditStatuses.*` labels to `src/locales/es.json`.
- [x] 1.2 Add the same keys to `src/locales/en.json`.

## 2. Financial tab

- [x] 2.1 Read `bank_name` and `bank_credit_status` from the contract in `src/features/contracts/components/ContractDetails/tabs/FinancialTab.jsx`.
- [x] 2.2 Render a bank block (bank input + status select) only for `financing_type === "bank"`.
- [x] 2.3 Include both values in the update payload, mapping empty strings to `null`.
- [x] 2.4 Show `—` for unknown or missing values in the read-only summary.

## 3. Tests

- [x] 3.1 Add a test for a bank contract showing the bank and status.
- [x] 3.2 Add a test for a bank contract with missing values.
- [x] 3.3 Add a test asserting the bank block is hidden for direct/cash.
- [x] 3.4 Add a test for the update payload.

## 4. Verification

- [x] 4.1 `npm run lint` passes.
- [x] 4.2 `npm run test:run` passes.
- [x] 4.3 `npm run build` passes.
- [x] 4.4 `openspec validate --changes` passes.
