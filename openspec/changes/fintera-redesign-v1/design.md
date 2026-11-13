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
`role="dialog"`, no Escape, no focus trap, stacked overlays). A `ContractDrawer`
is allowed only as an optional in-list preview.
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

### 4. Commission computed and frozen at approval
**Why**: rule changes must never rewrite history. Store `commission_rate` on the
contract at approval; backfill from audit/default on migration.
**Alternative**: compute on read — rejected because it would change past amounts.

### 5. Collection ends in "En revisión"
**Why**: sellers register proofs but never approve. Balance only moves on admin
approval, so a seller cannot change a contract's balance.

### 6. Tokens with `.dark` overrides
**Why**: Tailwind v4 utilities reference the variables, so light/dark variants
need no second stylesheet. Dark pass is deferred to PR 11.

### 7. Dashboard data = client composition first
**Why**: ships without backend work; `GET /dashboard/summary` is a fast-follow.

## Risks / Trade-offs

- **Scope breadth** (25 frames, 13 specs) → phase as PRs; each PR ships behind
  existing routes and keeps `npm run verify` green.
- **Two detail sources during migration** (modal and route) → keep the modal
  until PR 6 lands, then delete it.
- **Commission migration** → backfill is best-effort from audit; flag contracts
  without a rate for admin review.
- **Notifications API 401** → the bell cannot ship before the backend fix; gate
  the dropdown on the endpoint, never on an empty list.
- **Deleting `SidebarV2` and filters** → update `Router.test` and list tests.

## Migration Plan

1. PR 0 tokens + focus → PR 1 shell → PR 2 primitives I → PR 3 primitives II.
2. PR 4 lists (+ Contracts, user form) → PR 5 dashboard/seller → PR 6 contract +
  project → PR 7 reservation → PR 8 auth/settings/states → PR 9 responsive →
  PR 10 settings/commissions/notifications → PR 11 dark pass + performance.
3. Rollback: each PR is independently revertable; no data migrations other than
  the commission backfill (additive, non-destructive).

## Open Questions

- Whether `/dashboard/summary` should become an endpoint now or later.
- Whether `/signup` is removed or kept admin-gated.
- Exact backend field names for commissions and payment accounts.
