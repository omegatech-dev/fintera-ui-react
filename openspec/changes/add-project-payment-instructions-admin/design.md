## Context

The API exposes `GET/POST /projects/:project_id/payment-instructions` and
`PATCH/DELETE .../:instruction_id` under the admin group. FinteraWeb already
reads the public payload in the reservation payment step.

See `proposal.md` and
`openspec/changes/add-project-payment-instructions-admin/specs/project-payment-instructions-management/spec.md`.

## Goals / Non-Goals

**Goals:**

- Let an admin manage a project's bank accounts without touching the API.
- Keep the page consistent with the existing project pages (cards, forms,
  toasts, dark mode, locale keys).
- Protect admin-only behavior the same way the media panels do.

**Non-Goals:**

- A global accounts page across projects; accounts belong to a project.
- Drag-and-drop reordering; up/down buttons are enough.
- An enabled/disabled flag.
- Bank verification or imports.

## Decisions

### Dedicated route instead of an embedded panel

The account list can grow and needs its own header/back navigation. A route
(`/projects/:id/payment-instructions`) keeps the project edit form focused and
matches the user's preference. The edit page and project card link to it.

### One page component plus a reusable list

`pages/paymentInstructions/index.jsx` owns data loading, mutations, toasts and
states. `components/paymentInstructions/PaymentInstructionsPanel.jsx` renders
the list and forms so the markup stays testable.

### Position-based ordering

Each row has up/down controls that swap `position` with the neighbour through
two PATCH calls. The API returns accounts ordered by `position, id`, so the page
refetches after reordering.

### Client validation mirrors the API

Required fields and length caps are validated before the request, but the API
remains the source of truth; `422` responses surface as toasts.

## Risks / Trade-offs

- **Two PATCH calls per reorder.** Acceptable for a handful of accounts; no new
  bulk endpoint.
- **Optimistic updates avoided.** The page refetches after mutations to stay
  consistent with positions and audit effects.

## Migration Plan

No schema change. Deploy the page; it only calls existing endpoints. Rollback by
reverting the commit.
