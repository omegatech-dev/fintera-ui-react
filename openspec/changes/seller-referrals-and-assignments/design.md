## Context

See `proposal.md`. Relevant current state:

- Sellers use `/vendedor/*` routes behind `SellerRoute`; `/users` stays
  admin-only. `implementation-map.md` frames `21`–`23` are shipped; the seller
  extension frames (`05d`, `05i`, `21b`, `21d`, `21f`, `21g`, `21h`, `21i`,
  `22b`, `22c`) are drawn but not implemented.
- Commissions come from `GET /reports/commissions`, and `commission_amount` is
  stored on the contract at approval. Rates are per project
  (`commission_rate_direct|_bank|_cash`).
- Reservations are created in `features/projects/pages/reserve/` by a 3-step
  wizard; there is no seller field.
- The bell is `shared/header/NotificationsPopover.jsx`.
- There is no referral, assignment, score or historical-sale model in the API.

## Goals / Non-Goals

**Goals:**

- Ship the six design areas without inventing backend capabilities: referral
  link, assignment question, acceptance window, score, commission origin and
  historical migration.
- Keep the reservation flow unblocked when no seller is chosen.
- Make automatic assignment fair, explainable and testable.

**Non-Goals:**

- Custom seller domains (the other design note called this "dominios
  personalizados"; it is the referral link, not a separate feature).
- Email/WhatsApp delivery for assignment notifications; only the in-app bell is
  guaranteed by the design.
- Redesigning the existing contract, payment or project screens beyond the
  touched seller surfaces.

## Decisions

### Assignment state machine

`none → pending → accepted | expired`. Manual and automatic assignments start
`pending`; referral assignments are `accepted` immediately (no acceptance step).
"Rechazar" in the notification is an immediate expiry, not a separate state.
On expiry the API reassigns to the next eligible seller with the same algorithm;
the reservation continues regardless of the outcome.

### Automatic selection (round-robin weighted by score)

The API owns the selection; the UI only displays it. Proposal:

1. Candidate pool: active sellers with `score_level ∈ {green, yellow}` (red is
   excluded) and not already expired for this reservation.
2. Priority: green first, then yellow.
3. Within a level, order by `pending_load` ascending (number of active
   `pending` assignments), then by `last_assigned_at` ascending.
4. A per-level rotation cursor guarantees nobody repeats until everyone in the
   group received an attempt.
5. Random tiebreak inside the same level and load.
6. New sellers start green with zero load, so they get early attempts.

### Score

`accepted / (accepted + expired)` over a 90-day window, recomputed nightly.
Levels: green ≥ 85, yellow 60–84, red < 60. A seller with no history starts at
100 (green, labelled "Nuevo"). The admin override changes the value and the
colour is derived from the value; the override is audited with reason, actor and
date.

### Attribution

Visits to `/r/{referral_guid}` are stored with a 30-day window and last interaction wins.
A reservation created inside the window inherits `seller_id` from the link and
`origin = referral`; the attribution is cleared once the reservation exists so
the same link does not affect unrelated later reservations.

### Commission rate resolution

Per-seller exception first; otherwise the contract project's rate for its
financing type; otherwise the global default (5%). Contracts without a seller
use the configured "unassigned" rate (default 3%). The rate is frozen on the
contract when it is approved, so later rule changes never rewrite history.

### Historical records

A historical sale is a separate record, not a reservation. It stores client data,
free-text project name, lot, area, price, sale date, payment mode and status,
commission (rate, amount, paid/pending) and optional evidence. It creates no
lot block, does not change availability and never affects the score. It appears
in "Mis clientes" with a HISTÓRICO chip and stays "por validar" until an admin
validates or rejects it.

### Screens

- `21f` "Mi enlace": link, QR, copy/share, visits, attributed reservations,
  conversion, generated commission, rules and attributed reservations table.
- `21` seller home: referral card mirroring the `21f` headline metrics.
- `05d` reservation: "¿Un vendedor te atendió?" block with the list, "Buscar otro
  vendedor" and "No me atendió nadie"; the summary rail shows "Vendedor asignado".
- `05i` / `21g`: pending countdown, accepted (commission) and expired states;
  the bell offers Rechazar/Aceptar.
- `07b` / `07c`: score card (editable for admins) and read-only score with the
  90-day ratio and the override author.
- `21b`: "Importar CSV / Agregar cliente" plus the HISTÓRICO chip.
- `21d` / `22`: ORIGEN column and score badge/KPI.
- `21h` / `21i`: manual historical form and CSV import sheet.
- `22b`: default rate, payment rule, acceptance window and per-seller exceptions.

## Risks / Trade-offs

- [Assignment notifications are in-app only] → The design guarantees the bell;
  email/WhatsApp remains a follow-up and the UI must not promise them.
- [Automatic reassignment can override a manual choice] → Documented: a manual
  assignment that expires falls back to the automatic pool so the reservation
  keeps a seller. Flag this if product prefers leaving it unassigned.
- [Project rates vs. global default] → Precedence is documented above; the
  existing project rates keep working and the new default is only a fallback.
- [Historical duplicates] → CSV import offers "omitir duplicados por identidad";
  the API reports skipped rows instead of failing the batch.
- [Score gaming] → The override is audited and the score is recalculated
  nightly from immutable assignment events.

## Migration Plan

- Deploy the FinteraAPI change first (migrations, endpoints, jobs). The UI change
  is additive and reads new fields defensively (`next_payment`-style null
  handling) so an older API keeps the current screens working.
- No existing route changes; new routes are `/vendedor/enlace`,
  `/vendedor/clientes/historicos` and the historical import sheet.
- Rollback: revert the UI change; the API columns and tables are additive and can
  stay while the UI is rolled back.

## Open Questions

- Automatic reassignment after an expired **manual** assignment: keep the
  fallback to the automatic pool (proposed) or leave the reservation without a
  seller. Confirm during implementation.
