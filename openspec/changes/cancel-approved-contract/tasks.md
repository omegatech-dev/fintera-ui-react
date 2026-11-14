## 1. Contract actions

- [ ] 1.1 Show "Cancelar" for `approved` and `signed` contracts and update the confirmation copy
- [ ] 1.2 Remove `handleReopen`, the reopen menu item and `contractsApi.reopen`
- [ ] 1.3 Add i18n keys for the new cancel copy and remove reopen keys

## 2. Schedule and ledger

- [ ] 2.1 Render `cancelled` payments with a chip and no actions in `PaymentRow` and the schedule
- [ ] 2.2 Exclude `cancelled` payments from pending/overdue/progress counts
- [ ] 2.3 Show `refund` and cancellation `adjustment` entries in the ledger with a label fallback

## 3. Commission credit

- [ ] 3.1 Render the commission credit on the admin and seller commissions pages
- [ ] 3.2 Add an admin "Aplicar crédito" action that marks the credit settled

## 4. Documentation

- [ ] 4.1 Update `src/features/docs/content/{en,es}/contracts/{contract-detail-and-actions,contract-lifecycle,approving-contracts}.md`
- [ ] 4.2 Update `payments/payment-types-and-statuses.md` and `commissions/commissions-and-payouts.md`

## 5. Verification

- [ ] 5.1 `npm run verify`
- [ ] 5.2 Add/adjust tests for the cancel action, cancelled chip and credit display
