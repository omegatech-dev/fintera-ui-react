# Tasks

Status reflects the implementation on the `redesign/pr-*` branch stack.
Unchecked items are intentionally not done yet.

## 1. PR 0 — Tokens + focus

- [x] 1.1 Add the token layer to `src/index.css` (light + `.dark` overrides: canvas, surface, line, ink, brand, danger, warning, info, violet); verified in the browser.
- [x] 1.2 Remove `user-scalable=no` from `index.html`, set `maximum-scale` ≥ 5 and `<html lang>` from `LocaleContext`; verified at runtime.
- [x] 1.3 Add the global `:focus-visible` ring and remove the duplicate Google Fonts import (later replaced by self-hosted Urbanist).

## 2. PR 1 — Shell

- [x] 2.1 Add `src/shared/layout/nav.js` with prefix matching; fix the active state for child routes and delete `SidebarV2` (verify one `<aside>`). The full nav-config rendering of `Sidebar` is still pending.
- [x] 2.2 Extend `usePageTitle` for lots, reserve, payment instructions and contract routes; verify no route falls back to "Dashboard".
- [x] 2.3 Add `SellerRoute` and use it for `/vendedor/*`.
- [ ] 2.4 Rewrite `Sidebar` to render from the `NAV_ITEMS` config (icons included) and remove the 640–768px drawer conflict.

## 3. PR 2 — Primitives I

- [x] 3.1 Add `Button`, `Field`, `Input`, `Select`, `Card`, `Chip`, `Banner`, `EmptyState`, `ErrorState`, `Skeleton`, `SaveBar` with tests.
- [x] 3.2 Add `Dialog` and `ConfirmDialog`; replace all `window.confirm` calls (8 components) through `confirmDialog()`.

## 4. PR 3 — Primitives II

- [x] 4.1 Add `Tabs`, `Table`, `Pagination`, `Menu`, `Toggle`, `FileUpload`, `Stepper`, `SegmentedControl`.
- [x] 4.2 Add tests for tabs keyboard, table headers/`aria-sort`, pagination `aria-current`, toggle switch and segmented control.
- [ ] 4.3 Migrate the five hand-rolled modals (`PaymentData`, `PaymentScheduleModal`, `LotDetailsModal`, `PasswordResetModal`, `CommissionsModal`) to `Dialog` (PasswordResetModal and CommissionsModal done).

## 5. PR 4 — Lists

- [ ] 5.1 Move Projects, Lots, Contracts, Users and Payments onto `Table` + `Pagination` + `EmptyState` (Audits is done).
- [ ] 5.2 Build the consolidated `UserForm` and remove the old create/edit logic.

## 6. PR 5 — Dashboard

- [x] 6.1 Replace quick actions and the fake status banner with a data-backed action center (`payments/stats` + `contracts/stats`, `Promise.allSettled`, error state).
- [x] 6.2 Seller "Mi día" uses the existing seller dashboard stats plus the new workspace (clients, collections, documents).

## 7. PR 6 — Contract + project

- [x] 7.1 Add `/contracts/:guid` with tabs (Resumen, Cronograma, Pagos, Documentos), positive saldo/“saldo a favor” and ledger separation; verified with real data.
- [ ] 7.2 Project detail page (05b), media (05e), CSV import (05f) restyled on the new primitives; bank accounts already exist in `paymentInstructions`.

## 8. PR 7 — Reservation

- [x] 8.1 Validate the client (existing or name + phone + identity) in `reserveRules` and `handleSubmit`, with tests.
- [ ] 8.2 Extract the 3-step wizard and inline field errors.

## 9. PR 8 — Auth, settings, states

- [x] 9.1 Restrict `/signup` to admins.
- [ ] 9.2 Rebuild sign-in with the new primitives and migrate the reset/terms modals to `Dialog`.
- [x] 9.3 Settings navigation cross-links admin (General, Marca) and account (Perfil, Seguridad, Términos) sections; every section already uses `SettingsSaveBar`.

## 10. PR 9 — Responsive

- [x] 10.1 44px drawer targets, scrollable tabs, bottom navigation on <768px, 72px content offset; verified at 390px.
- [x] 10.2 Replace the fixed `pt-[100px]` page offsets with the shared `page-shell` utility (25 screens); M1/M2/18 layouts remain as follow-up polish.

## 11. PR 10 — Commissions + notifications

- [x] 11.1 Admin commissions report at `/commissions` (period, seller filter, KPIs, table, CSV) using the existing `/reports/commissions`.
- [x] 11.2 Seller read-only route `/vendedor/comisiones` behind `SellerRoute`.
- [x] 11.3 Mobile notifications bell with unread dot, dropdown, mark-read and a 401 retry.
- [x] 11.4 Commission payout tracking: `commission_paid_at/by`, `PATCH /contracts/:guid/commission/pay`, audit event and the admin "Marcar pagada" action.
- [x] 11.5 Seller workspace `/vendedor/*`: clients, collection queue with receipt upload ("En revisión") and documents, scoped to the seller's contracts.
- [x] 11.6 Tour completion stored per user and the PWA manifest corrected (name, scope, colors, lang, categories).

## 12. PR 11 — Dark + performance

- [x] 12.1 Global `prefers-reduced-motion`.
- [x] 12.2 Self-host Urbanist (latin variable woff2) and remove the Google Fonts import.
- [x] 12.3 Dark-mode pass on the redesigned screens: dashboard, commissions, seller workspace and settings were reviewed at desktop and mobile; the fixed 308px sidebar/content overlap was corrected.
- [x] 12.4 Font Awesome already uses named icon imports and the build splits vendor/charts/motion/quill/rollbar; the vendor chunk stays under ~341 KB. A hard CI budget check remains optional.

## 13. Verification

- [x] 13.1 `npm run verify` (lint + test:run + build) green on every branch.
- [x] 13.2 Local runtime: web `5174` and API `8081` healthy; key flows checked in the browser.
- [ ] 13.3 Sync these delta specs to `openspec/specs/` and archive the change once the unchecked items land.
