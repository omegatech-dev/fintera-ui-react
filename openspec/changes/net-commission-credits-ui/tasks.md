## 1. Backend contract and commissions API

- [x] 1.1 Confirm backend response fields for payout preview, payout result, credit applications, and seller balance against `design.md`.
- [x] 1.2 Add the payout-preview request to `src/features/commissions/api.js` and cover its route and response handling in `src/features/commissions/api.test.js`.
- [x] 1.3 Update commission response normalization in `src/features/commissions/utils/credits.js` for applied amount, remaining amount, source, and active applications.

## 2. Admin commission payout

- [x] 2.1 Load payout preview before opening confirmation in `src/features/commissions/pages/index.jsx`; show gross, applied credit, and net cash when enabled, and gross-only information when disabled.
- [x] 2.2 Prevent payout confirmation when preview loading fails; ensure the payout request remains a single server operation and display the server-returned final breakdown.
- [x] 2.3 Remove the manual credit-apply handler and action from the admin commission view.
- [x] 2.4 Add or update admin page tests in `src/features/commissions/pages/index.test.jsx` for enabled/disabled preview, preview failure, changed final response, and no manual apply action.

## 3. Credit balance views

- [x] 3.1 Replace the computed net-payable tile in `src/features/commissions/components/CommissionCreditsCard.jsx` with the global seller balance and show credit source, remaining amount, and active application destinations.
- [x] 3.2 Pass backend seller-balance and application data through the admin commissions page and seller workspace in `src/features/commissions/pages/index.jsx` and `src/features/seller/pages/index.jsx`.
- [x] 3.3 Add or update component and seller workspace tests for global balance, paginated credits, application details, and read-only seller presentation.

## 4. Localization and documentation

- [x] 4.1 Add English and Spanish translations in `src/locales/en.json` and `src/locales/es.json` for payout preview/result, seller balance, applied amount, remaining amount, and application history; remove obsolete apply-credit and net-payable copy where no longer used.
- [x] 4.2 Update `src/features/docs/content/en/commissions/commissions-and-payouts.md` and `src/features/docs/content/es/commissions/commissions-and-payouts.md` to describe server-side netting, payout breakdowns, and read-only credit history.

## 5. Verification

- [x] 5.1 Run relevant commissions and seller tests, then `npm run verify`.
- [ ] 5.2 Verify the UI against the backend with netting disabled and enabled, including partial application, remaining balance, preview failure, and server-confirmed payout values.
