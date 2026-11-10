## Context

The contract details modal already has a Financial tab that edits
`payment_term`, `reserve_amount`, `down_payment` and `max_payment_date` for
pending contracts. Bank financing adds two informational fields that admins
need to read and correct.

See `proposal.md` and
`openspec/changes/show-bank-credit-details/specs/contracts/spec.md`.

## Goals / Non-Goals

**Goals:**

- Make the customer-reported bank and credit stage visible at a glance.
- Let an admin correct them without leaving the contract details.
- Keep the existing financial edit flow and confirmation behavior.

**Non-Goals:**

- A bank catalog or validation against real institutions.
- Automatic credit-status transitions.
- Showing this data outside the contract details.

## Decisions

### Same Financial tab, new bank block

The values belong with the rest of the financing data, so they live in the
Financial tab rather than a new tab. The block renders only when
`financing_type === "bank"` to avoid noise on direct/cash contracts.

### Friendly labels with a raw fallback

A small map translates `not_started`, `pre_qualified`, `pre_approved` and
`approved` into localized labels. Unknown or empty values render `—`; the
select only offers the four API values plus an empty option.

### Reuse the existing update call

The form already sends a partial contract payload. Adding `bank_name` and
`bank_credit_status` (empty string → `null`) avoids a new endpoint or a
separate save action.

## Risks / Trade-offs

- **Stale API:** if the API is older, the fields are simply absent and the
  block renders `—`; the update payload is ignored by the backend.
- **Empty bank name:** allowed so an admin can clear a mistake.

## Migration Plan

Deploy the API first; the UI change is additive. Rollback by reverting the UI
commit — no persisted data changes.
