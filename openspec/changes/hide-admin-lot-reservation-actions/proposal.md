## Why

Admins currently see a **Reservar** action on available lots and can start a
reservation for a client from the admin portal. Creating reservations belongs
to the sales workflow (sellers) or to the customer portal, so the admin portal
should present lot review and editing actions instead.

## What Changes

- Hide the **Reservar** action for admins on available lot cards; admins see
  **Ver** and open the lot detail sheet instead.
- Hide the **Reservar lote** action in the lot detail sheet for admins. Admins
  keep the **Editar Lote** action.
- Show **Ver** instead of **Reservar** on available lots in the project detail
  **Lotes** tab for admins.
- Keep the existing **Reservar** action for sellers in every lot surface.
- Leave the reservation route and API unchanged. This is a UI visibility change
  only; direct URL access is not blocked.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `projects`: lot cards, the lot detail sheet, and the project detail lots tab
  no longer offer a reservation action to admins; sellers keep it.

## Impact

- `src/features/projects/components/lots/LotCard.jsx`
- `src/features/projects/components/lots/LotDetailsModal.jsx`
- `src/features/projects/pages/detail/index.jsx`
- Tests under `src/features/projects/components/lots/`
- Documentation under `src/features/docs/content/en/` and `es/`
- No API, backend, dependency, or data changes.
