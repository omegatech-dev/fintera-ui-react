## Context

The lot list (`src/features/projects/pages/lots/index.jsx`), the lot detail
sheet (`src/features/projects/components/lots/LotDetailsModal.jsx`), and the
project detail lots tab (`src/features/projects/pages/detail/index.jsx`) all
render a **Reservar** action for available lots. The lot list already knows the
current role through `AuthContext` and passes `isAdmin` to the card and sheet.
Reservation creation belongs to sellers and the customer portal.

## Goals / Non-Goals

**Goals:**

- Remove the reservation action from the admin portal's lot surfaces.
- Keep lot review and editing available to admins.
- Preserve the reservation action for sellers.
- Cover the role split with component tests.

**Non-Goals:**

- Blocking the reservation route or API for admins.
- Changing the reservation wizard, contract payloads, or backend permissions.
- Changing lot statuses, filtering, or pagination.

## Decisions

### Reuse the existing `isAdmin` signal

`LotsList` already computes `userRole === "admin"` and passes it to `LotCard`
and `LotDetailsModal`. The change uses that signal instead of adding a new
role prop or context read, keeping the role decision at the page boundary.

### Admin available-lot action becomes View

For an available lot, `LotCard` renders **Ver** and calls `onView` when
`isAdmin` is true. Non-admins keep **Reservar** and `onReserve`. This avoids
leaving an available card without a primary action.

### The sheet hides reserve instead of changing its navigation

`LotDetailsModal` keeps the existing `onReserve` prop for sellers and hides the
button when `isAdmin` is true. Admins retain **Editar Lote**. The contract
detail page already renders the sheet without `onReserve`, so it is unaffected.

### Project detail tab uses the same role split

The project detail lots tab already navigates to the lot list. For admins the
button label becomes **Ver**; for sellers it remains **Reservar**.

## Risks / Trade-offs

- **Admins can still reach the reservation route by URL** → Accepted for this
  change. The UI no longer exposes the action. A seller-only route guard or
  backend permission would be a separate change if hard enforcement is needed.
- **Future roles** → The current rule is role-specific (`admin`). If another
  role must not reserve, the page should pass an explicit capability prop rather
  than extending the `isAdmin` check.

## Migration Plan

1. Deploy the UI change.
2. No data migration or API deployment is required.
3. Rollback is a UI revert.
