## Context

See proposal.md for motivation and the delta specs for requirements. The design
reference is `documentation/design/implementation-map.md`; the visual source is
`documentation/design/fintera-redesign.pen`. The app is React 19 + Vite 8,
Tailwind 4, React Router 7, with `AdminRoute`/`AdminOrOwnerRoute` guards,
`apiClient`, LocaleContext, OnboardingContext and a duplicated sidebar.

## Goals / Non-Goals

**Goals**

- One navigation model and one accessible primitive set used by every screen.
- Behavior fixes called out in the delta specs (contract as route, ledger
  balance rule, reservation client validation, approval dialogs, commission
  freeze at approval, collection = "En revisión").
- Phased, shippable migration (PR 0 → PR 11) with `npm run verify` green.

**Non-Goals**

- Customer portal (external) and public account creation.
- New UI/state library, TypeScript, `lucide-react`.
- A full backend redesign; only the API surface in §11 of the map.

## Decisions

### 1. Contract detail as a route, not a modal
**Why**: deep-linkable, and it eliminates the modal class of bugs (no
`role="dialog"`, no Escape, no focus trap, stacked overlays). The route is
`/contracts/:guid` and reuses the **existing** `GET /api/v1/contracts/:guid`
endpoint (admin/seller/owner), so no backend change was required. The modal
remains only for quick in-list previews.
**Alternative**: keep the modal and add focus management — rejected because it
keeps two sources of truth for one detail screen.

### 2. `GenericList` for simple lists, `Table` for money lists
**Why**: `GenericList` already serves docs and audits; rewriting every list at
once would be a risky big-bang. `Table` adds semantic `<th>`, `aria-sort`,
`aria-current` and mobile cards where it matters (payments, contracts, users).
**Alternative**: replace `GenericList` everywhere — rejected for scope/risk.

### 3. Font Awesome, Urbanist self-hosted, no new dependencies
**Why**: the app already ships both. Mapping the Lucide names used in the mocks
is cheaper than a library change and keeps the bundle stable.

### 4. Commission data already exists on the backend
**Why**: the API already stores `commission_rate_direct/_bank/_cash` on the
project (editable in the project form) and `commission_amount` on the contract,
computed at approval. The admin panel therefore reads
`GET /api/v1/reports/commissions` (admin sees all, seller is filtered by creator)
plus the CSV export; no new endpoint or migration is needed for the report.
**Scope**: payout tracking ("Pagar" with a paid status) is **not** implemented —
there is no backend state for it. It is tracked as a remaining task, not faked in
the UI.

### 5. Collection ends in "En revisión"
**Why**: sellers register proofs but never approve. Balance only moves on admin
approval, so a seller cannot change a contract's balance.

### 6. Tokens with `.dark` overrides
**Why**: Tailwind v4 utilities reference the variables, so light/dark variants
need no second stylesheet. Dark pass is deferred to PR 11.

### 7. Dashboard data = client composition first
**Why**: ships without backend work; `GET /dashboard/summary` is a fast-follow.
Implemented with `Promise.allSettled` over `payments/stats` and
`contracts/stats`.

### 8. Notifications: the 401 was a client race, not a missing endpoint
**Why**: the token reaches `apiClient` from `AuthContext`; child header effects
run before the provider's hydration effect, so the bell could fire an
unauthenticated request. The fix waits for the auth token and retries once on
401. No backend change required.

### 9. Self-hosted Urbanist
**Why**: removes the blocking Google Fonts request and the duplicate import; one
27 KB variable woff2 (latin) covers 300–700.

### 10. Commission payout is a real backend state
**Why**: a paid badge must survive reloads and be auditable. Added
`commission_paid_at` / `commission_paid_by` to contracts (migration `000029`),
`PATCH /contracts/:guid/commission/pay` (admin only) and a `COMMISSION_PAID`
audit event. Paying twice is rejected; the amount is computed and persisted at
payout time if an older contract has none.

### 11. Seller workspace reuses seller-scoped contracts
**Why**: `/contracts` already filters by `creator_id` for sellers, so clients,
outstanding balances and the documents entry point can be derived without new
list endpoints. Registering a collection uploads a receipt through the existing
payment endpoint, which sets the payment to `submitted` ("En revisión") and now
writes an `UPLOAD_RECEIPT` audit event.

## Risks / Trade-offs

- **Scope breadth** (25 frames, 13 specs) → phase as PRs; each PR ships behind
  existing routes and keeps `npm run verify` green.
- **Two detail sources during migration** (modal and route) → keep the modal
  until PR 6 lands, then delete it.
- **Commission payout** → no backend status exists; the report is read-only
  until a payout endpoint lands. Do not fake a paid state.
- **Notifications API 401** → resolved in the client (token guard + retry); the
  bell never renders an empty list as if there were nothing to show.
- **Deleting `SidebarV2` and filters** → update `Router.test` and list tests.

## Migration Plan

1. PR 0 tokens + focus → PR 1 shell → PR 2 primitives I → PR 3 primitives II.
2. PR 4 lists (+ Contracts, user form) → PR 5 dashboard/seller → PR 6 contract +
  project → PR 7 reservation → PR 8 auth/settings/states → PR 9 responsive →
  PR 10 settings/commissions/notifications → PR 11 dark pass + performance.
3. Rollback: each PR is independently revertable; no data migrations other than
  the commission backfill (additive, non-destructive).

## Open Questions

Resolved during implementation:

- Dashboard uses client composition; `/dashboard/summary` remains a fast-follow.
- `/signup` is admin-gated; public creation lives in the customer portal.
- Commission and payment-account field names were verified against the Go backend.

Remaining (needs product/backend decisions):

- Commission payout: paid status, payout date and audit event.
- Seller collections: register-collection endpoint (proof → "En revisión").
- Seller client listing endpoint for `/vendedor/clientes`.
