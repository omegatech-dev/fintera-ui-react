## Why

The seller redesign adds four connected capabilities that do not exist yet:
attributed referral links, in-reservation seller assignment with a 2-hour
acceptance window, an acceptance score that drives automatic assignment, and
historical-sale migration. Without them a seller cannot prove which clients they
brought, admins cannot see who is owed a commission, and automatic assignment
would pick sellers without fairness or accountability.

The designs are in `documentation/design/fintera-redesign.pen` (frames `05d`,
`05i`, `21`, `21b`, `21d`, `21f`, `21g`, `21h`, `21i`, `22`, `22b`, `22c`,
`07b`, `07c`) and the customer portal in `fintera-landing.pen`.
`documentation/design/seller-flow-changes.md` is the design summary; this change
turns it into shippable behavior.

## What Changes

- **Referral link**: every seller gets a unique slug. `/r/{slug}` records visits
  and carries the attribution (30-day window, last interaction wins). The seller
  gets a public link with QR, copy and share (frame `21f`), a "Mi enlace" nav
  item, and a referral card on their home (`21`). A reservation created with an
  active attribution is assigned to the link owner (`origin = referral`) with no
  acceptance step.
- **Seller assignment in the reservation (`05d`)**: "¿Un vendedor te atendió?"
  with the seller list, "Buscar otro vendedor" and "No me atendió nadie"
  (automatic). The question does **not** block progress: leaving it empty or
  choosing "No me atendió nadie" auto-assigns. `origin` is
  `referral | manual | automatic`.
- **Acceptance window**: manual and automatic assignments start `pending`, notify
  the seller in the bell (`21g`) with a 2-hour countdown, and end `accepted` or
  `expired`. Expiring loses the commission, lowers the score and triggers a
  background reassignment to the next eligible seller until one accepts. The
  reservation itself never blocks.
- **Acceptance score**: `accepted / (accepted + expired)` over 90 days,
  recomputed nightly. Green ≥ 85, yellow 60–84, red < 60. New sellers start
  green. Admins can override the value (audited). Shown on `07b` (editable),
  `07c` (read-only), `22` (badge) and `21d` (KPI); never visible to the customer.
- **Commissions**: an `ORIGEN` column (Enlace / Directo / Histórico) on `21d`,
  per-seller rate exceptions and the "unassigned" rate on `22b`, and historical
  commissions included in the period KPIs with their real sale date.
- **Historical migration**: manual form (`21h`), CSV import (`21i`) and the
  "Importar CSV / Agregar cliente" buttons plus the HISTÓRICO chip (`21b`).
  Historical records create no reservation, block no lot, do not affect stock or
  score, store the commission with the real sale date and stay "por validar"
  until an admin validates them.

**BREAKING**: seller selection in the reservation is no longer blocking; it
auto-assigns when omitted. Commissions now carry an origin and may use a
per-seller rate exception.

## Capabilities

### New Capabilities

- `seller-referrals`: public referral link, QR/share, visit attribution and the
  "Mi enlace" screen.
- `seller-assignments`: the reservation seller question, assignment lifecycle,
  acceptance countdown and reassignment.
- `seller-score`: acceptance score display, levels and admin override.
- `historical-sales`: manual and CSV migration of historical clients and sales.

### Modified Capabilities

- `commissions`: origin column, per-seller rate exceptions and historical
  commissions in the period KPIs.
- `notifications`: assignment notifications with a countdown and
  accept/reject actions.
- `users`: seller score panel on the user form and detail.

## Impact

- UI: `src/features/seller/**`, `src/features/projects/pages/reserve/**`,
  `src/features/contracts/**`, `src/features/commissions/**`,
  `src/features/users/**`, `src/shared/header/NotificationsPopover.jsx`,
  `src/shared/layout/nav.js`, `src/Router.jsx`, `src/locales/{en,es}.json`.
- API: depends on the FinteraAPI `seller-referrals-and-assignments` change
  (data model, endpoints and background jobs).
