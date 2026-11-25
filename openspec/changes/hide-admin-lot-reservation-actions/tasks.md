## 1. Admin lot actions

- [x] 1.1 Update `src/features/projects/components/lots/LotCard.jsx` so an available lot shows **Ver** and calls `onView` when `isAdmin` is true; non-admins keep **Reservar** and `onReserve`.
- [x] 1.2 Update `src/features/projects/components/lots/LotDetailsModal.jsx` to hide **Reservar lote** when `isAdmin` is true while keeping **Editar Lote**.
- [x] 1.3 Update `src/features/projects/pages/detail/index.jsx` so the project detail lots tab labels available lots **Ver** for admins and keeps **Reservar** for sellers.

## 2. Tests

- [x] 2.1 Add a `LotCard` test for an admin viewing an available lot: no reserve action, view action opens the detail, and `onReserve` is not called.
- [x] 2.2 Update `LotDetailsModal.test.jsx` so the admin case expects no reserve action and add a seller case that expects the reserve action.

## 3. Documentation

- [x] 3.1 Update `src/features/docs/content/en/projects-lots/lots-and-statuses.md` and `src/features/docs/content/en/contracts/reservations-and-holds.md` to state that admins review lots and sellers create reservations.
- [x] 3.2 Update the matching Spanish articles under `src/features/docs/content/es/projects-lots/` and `src/features/docs/content/es/contracts/`.
- [x] 3.3 Confirm the `projects` spec delta describes the shipped admin and seller behavior.

## 4. Verification

- [x] 4.1 Run `npm run lint`.
- [x] 4.2 Run `npm run test:run`.
- [x] 4.3 Run `npm run build` (or `npm run verify` to cover lint, tests, and build together).
- [x] 4.4 Run `openspec validate --specs`.
