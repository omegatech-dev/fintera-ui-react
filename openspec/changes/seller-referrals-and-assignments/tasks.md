## 1. Foundation

- [x] 1.1 Add `src/features/seller/api.js` methods for referrals, assignments, score and historical sales, plus matching tests
- [x] 1.2 Add routes in `src/Router.jsx`: `/vendedor/enlace` (`SellerRoute`), historical form and import entry points; add the "Mi enlace" item to `src/shared/layout/nav.js` for sellers
- [x] 1.3 Add `sellerReferrals`, `sellerAssignments`, `sellerScore` and `historicalSales` keys to `src/locales/es.json` and `src/locales/en.json`
- [x] 1.4 Add the score helpers in `src/features/seller/utils/score.js` (`scoreLevel(value)`, `formatScore`) with unit tests for 85/84/60/59 and the empty/new case

## 2. Referral link

- [x] 2.1 Build `src/features/seller/pages/referral/index.jsx` (frame `21f`): public URL, copy, WhatsApp share and QR
- [x] 2.2 Add the metrics row (visits, attributed reservations, conversion, generated commission) and the "Cómo funciona" + "Reglas de comisión" blocks
- [x] 2.3 Add the attributed reservations table (client, lot/project, amount, commission, status, date) with the existing `Table` primitive
- [x] 2.4 Add the referral card to `src/features/dashboard/pages/SellerDashboard.jsx` (`21`) reusing the metric components
- [x] 2.5 Test copy/share/QR states and that the referral screen renders empty, loading and error states

## 3. Assignment in the reservation

- [x] 3.1 Add the "¿Un vendedor te atendió?" block to the client step of `src/features/projects/pages/reserve/`: seller list, "Buscar otro vendedor" and "No me atendió nadie"
- [x] 3.2 Keep the field non-blocking; when empty or "No me atendió nadie", submit `assignment_origin = automatic`; when a seller is chosen, submit `manual` and its `seller_id`
- [x] 3.3 Show "Vendedor asignado" in the summary rail and update it when the selection changes
- [x] 3.4 Do not show any commission, score or origin to the customer; keep "Tasa 0% · Sin cargos adicionales"
- [x] 3.5 Test the three paths (chosen seller, search, nobody) and that the wizard advances without a seller

## 4. Acceptance window and bell

- [x] 4.1 Extend `src/shared/header/NotificationsPopover.jsx` with assignment items: countdown, Aceptar and Rechazar, and the expired variant (`21g`, `05i`)
- [x] 4.2 Add `src/features/seller/components/AssignmentCard.jsx` for the pending/accepted/expired states with the commission estimate and the "perdiste la comisión" copy
- [x] 4.3 Wire accept/reject to the API, refresh the bell badge and the seller queue, and surface errors without losing the item
- [x] 4.4 Test countdown formatting, accept, reject and expiration copy, including the mobile dropdown

## 5. Score

- [x] 5.1 Add the score panel to `src/features/users/components/UserForm.jsx` (frame `07b`): value, colour derived from the value, admin-only note and override reason
- [x] 5.2 Add the read-only score block to the user detail sheet/drawer (`07c`): ratio, 90-day window, override author and date
- [x] 5.3 Replace the seller commissions KPI on `src/features/seller/pages/commissions/` with the score KPI (`21d`)
- [x] 5.4 Add the score badge next to the seller on the admin commissions table (`22`)
- [x] 5.5 Test the level boundaries, the override request and that the score never appears in a customer surface

## 6. Commissions (origin and rules)

- [x] 6.1 Add the `ORIGEN` column to `src/features/seller/pages/commissions/` (`21d`) with Enlace / Directo / Histórico chips
- [x] 6.2 Extend `src/features/commissions/components/CommissionRulesSheet.jsx` (`22b`) with default rate, payment rule, acceptance window and per-seller exceptions
- [x] 6.3 Include historical commissions in the period KPIs using their real sale date, and keep them identifiable by origin
- [x] 6.4 Test the column rendering, the rules save payload and the KPI totals with and without historical rows

## 7. Historical migration

- [x] 7.1 Build `src/features/seller/pages/clients/historical/index.jsx` (`21h`): client data, sale, payment mode, sale status, commission and optional evidence
- [x] 7.2 Build the CSV import sheet (`21i`): dropzone, template download, the three toggles, column mapping and the valid/error summary
- [x] 7.3 Add "Importar CSV / Agregar cliente" to `src/features/seller/pages/clients/` (`21b`) and the HISTÓRICO chip on historical rows
- [x] 7.4 Show "Histórico · por validar" until validation, and the admin validate/reject action
- [x] 7.5 Test the manual form payload, the CSV mapping/skip-duplicates toggles and that a historical record does not appear as a reservation or lot block

## 8. Verification

- [x] 8.1 Run `npm run lint` and fix any reported issue
- [x] 8.2 Run `npm run test:run` and fix any failing test
- [x] 8.3 Run `npm run build` and confirm the production bundle builds
- [x] 8.4 Check frames `05d`, `05i`, `21`, `21b`, `21d`, `21f`, `21g`, `21h`, `21i`, `22`, `22b`, `22c`, `07b`, `07c` at 1440 and 390
- [x] 8.5 Update `documentation/design/seller-flow-changes.md` status and the relevant feature docs

## Known follow-ups (coherence audit)

Remaining items from the coherence audit that are intentionally deferred:

- Expose `score_override_by_name` in user responses so `07c` can name the admin who overrode the score.
- Mount `AssignmentCard`'s accepted state on the seller dashboard/queue (today only pending is actionable in the bell).
- Decide whether `accrued` / `cancelled` commission states are part of the contract or the design should be updated to `pending/paid`.
- Complete the CSV column mapping (all 15 fields) and normalize `payment_mode` / `sale_status` to the design values.
- Upload the historical evidence file instead of storing only its filename.
- Paginate historical sales and surface load errors instead of silently showing an empty list.
- Format period boundaries in local time (avoid `toISOString`) so UTC+ zones do not shift the month.
- Localize assignment notifications (ES/EN) or send structured type + data and render on the client.
- Add `assignment_id` to notifications and do not silence `/assignments/pending` failures.
- Align the referral rules copy ("ventas cerradas" vs approval) and remove "podrás cambiarlo después" if no manual reassignment endpoint exists.
- Add the average rate as a fourth admin commissions KPI card.
- Generate the QR locally / download it as a blob instead of depending on an external QR service.
- Confirm the share action with a toast.
- Consume `location.state.openHistoricalImport` so the sheet cannot reopen on its own.
- Add conversion to the `21` referral card to mirror `21f`.
- Add tests for acceptance → portfolio, CSV 207/duplicates, customer payload redaction, `ref` attribution and the configurable acceptance window.
