# Tasks

## 1. PR 0 — Tokens + focus

- [ ] 1.1 Add the token layer to `src/index.css` (light values + `.dark` overrides: canvas, surface, line, ink, brand, danger, warning, info, violet), verify Lighthouse `color-contrast` no longer fails on `/docs` and `/projects`.
- [ ] 1.2 Remove `user-scalable=no` from `index.html`, set `maximum-scale` ≥ 5 and `<html lang>` from `LocaleContext`; verify the `meta-viewport` failure is gone.
- [ ] 1.3 Add a global `:focus-visible` ring (2px brand + 2px offset) and remove the duplicate Google Fonts import from `src/index.css` / `src/assets/css/style.css`.

## 2. PR 1 — Shell

- [ ] 2.1 Create `src/shared/layout/nav.js` (role-filtered items with `match` prefixes) and rewrite `Sidebar` to consume it; verify `/projects/:id/lots` keeps Proyectos active and exactly one `<aside>` renders (delete `SidebarV2`).
- [ ] 2.2 Extend `usePageTitle` to every route (including `/projects/:id/lots` and the reserve route) and set `document.title` from branding; verify no route falls back to "Dashboard".
- [ ] 2.3 Fix the 640–768px drawer conflict and add the new `SellerRoute` (admin + seller) for `/vendedor/*`; update `src/Router.test.jsx`.

## 3. PR 2 — Primitives I

- [ ] 3.1 Add `Button`, `Field`, `Input`, `Select`, `Card`, `Chip`, `Banner`, `EmptyState`, `ErrorState`, `Skeleton`, `SaveBar` to `src/shared/ui/` with tests for variants and `aria-*` wiring.
- [ ] 3.2 Add `Dialog` (role dialog, aria-modal, Esc, focus trap, scroll lock, restore focus) and `ConfirmDialog`; replace all 9 `window.confirm` calls.

## 4. PR 3 — Primitives II

- [ ] 4.1 Add `Tabs`, `Table`, `Pagination`, `Menu`, `Toggle`, `FileUpload`, `Stepper`, `SegmentedControl` and a `Toast` provider; migrate `PaymentData`, `PaymentScheduleModal`, `LotDetailsModal`, `PasswordResetModal`, `CommissionsModal` to `Dialog`.
- [ ] 4.2 Add tests for keyboard behavior (arrows, Esc, aria-selected, aria-sort, aria-current).

## 5. PR 4 — Lists

- [ ] 5.1 Move Projects, Lots, **Contracts**, Users, Payments, Audits onto `Table`/`Card` + `Pagination` + `EmptyState`; delete `PaginationV2`, `GenericFilter`, `SearchFilterBar`.
- [ ] 5.2 Build `UserForm` (create/edit) with role/permission summary and deactivation via `ConfirmDialog`; collapse the 656-line create page and the inline edit logic.

## 6. PR 5 — Dashboard

- [ ] 6.1 Implement the admin action center (vencidos, por aprobar, reservas sin contrato) and the seller "Mi día" queue; compose from `paymentsApi`/`contractsApi`/`projectsApi`/`auditsApi` with `Promise.allSettled`; remove the fake status banner and the `Access` label.

## 7. PR 6 — Contract + project

- [ ] 7.1 Add the `/contracts/:id` route with tabs (Resumen, Cronograma, Pagos, Documentos, Notas), enforce the ledger rule (scheduled rows show `—`) and the positive-saldo/overpayment rule.
- [ ] 7.2 Build project detail (05b), Medios (05e), CSV import (05f) and bank accounts CRUD with one default (05c/05d).

## 8. PR 7 — Reservation

- [ ] 8.1 Split the reserve page into `ReserveWizard` + 3 steps + `SummaryRail` + `useReserveForm`; add per-field validation including the previously unvalidated client, and the summary rail; replace `errors.join(". ")` with field errors.

## 9. PR 8 — Auth, settings, states

- [ ] 9.1 Rebuild sign-in with `BrandPanel` + `Field` + `Button`; restrict `/signup` to admin or remove it (public account creation stays in the portal); migrate reset and terms to `Dialog`.
- [ ] 9.2 Implement the consolidated `SettingsNav` (General, Identidad de marca, Perfil, Seguridad, Términos) with per-section `SaveBar`, and the 403/404 states; set route titles.

## 10. PR 9 — Responsive

- [ ] 10.1 Implement the mobile/tablet layouts (frames M1/M2/18): bottom nav, sticky summary sheet, 2×2 KPIs, 44px targets, and a working mobile bell.

## 11. PR 10 — Settings, commissions, notifications

- [ ] 11.1 Ship the admin commissions area (22) with KPIs, filters, pay action and the rules sheet (22b); commission is frozen at approval; seller view stays read-only.
- [ ] 11.2 Ship `NotificationsPopover` with unread badge, typed items, filter and mark-read, after fixing the notifications 401.
- [ ] 11.3 Rewrite the onboarding tour to run once per user and fix the PWA manifest (name, lang, theme-color).

## 12. PR 11 — Dark pass + performance

- [ ] 12.1 Add dark variants for every token and verify contrast on dashboard, contracts and payments in dark mode.
- [ ] 12.2 Self-host Urbanist woff2 (400/500/600/700) in `public/fonts`, subset Font Awesome, split framer-motion/chart.js/quill, and set a bundle budget; re-run Lighthouse on the same three screens.

## 13. Verification

- [ ] 13.1 Run `npm run verify` (lint + `test:run` + build) and fix any failures introduced by this change.
- [ ] 13.2 Sync the delta specs to `openspec/specs/<capability>/spec.md` and update `documentation/design/implementation-map.md` if behavior, conventions or structure changed.
