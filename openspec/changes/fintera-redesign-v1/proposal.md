# fintera-redesign-v1

## Why

FinteraUI has accumulated three eras of UI in one app: duplicated navigation,
`aria-label="none"` on 17 controls, 7–11px text, 2.2:1 contrast, modals without
`role="dialog"`/Escape/focus trap, raw debug identifiers (`SYS-AUTH // <uuid>`),
contradictory status counters (15 ≠ 11 + 0 + 0), and an admin home that shows
shortcut cards instead of what needs attention. The reserve flow does not
validate the client, the contract detail is a modal with no focus management,
and there is no admin surface for commissions, no project bank-accounts editor,
and no seller collection flow.

The design work for this plan is complete: `documentation/design/fintera-redesign.pen`
(frames 00–23 + sheets and mobile) and `documentation/design/implementation-map.md`
(tokens, primitives, routes, components, permissions and PR plan).

## What Changes

- **App shell**: one navigation config (`src/shared/layout/nav.js`), delete the
  duplicate sidebar, prefix-matched active state, route-aware page titles and
  `<html lang>`.
- **Design tokens + primitives** in `src/index.css` and `src/shared/ui/`:
  brand green 700 (5.0:1), 11px floor, radii 6/10/14/16, `Button`, `Field`,
  `Input`, `Select`, `Card`, `KpiCard`, `Chip`, `Banner`, `EmptyState`,
  `ErrorState`, `Skeleton`, `Dialog`, `ConfirmDialog`, `Tabs`, `Table`,
  `Pagination`, `Menu`, `Toggle`, `FileUpload`, `Stepper`, `SegmentedControl`,
  `Toast`, `SaveBar`.
- **Accessibility**: re-enable zoom, real focus-visible ring, 44px targets,
  `role="dialog"`/`aria-modal`/focus trap/Esc/restore-focus, real `<th>`,
  `aria-sort`, `aria-current`, charts with accessible names, `lang` from locale.
- **Dashboard**: admin action center (vencidos, por aprobar, reservas) and a
  seller "Mi día" home; remove the fake system-status banner.
- **Contracts**: list with reconciled counters, contract number as identifier,
  detail becomes a **route** `/contracts/:id` (not a modal), tabs
  Resumen/Cronograma/Pagos/Documentos/Notas, ledger where scheduled rows never
  alter the balance, saldo always positive, actions behind one overflow.
- **Reservation**: 3-step wizard (lote y cliente → plan → documentos) with
  per-field validation, including the previously unvalidated client, and a
  sticky summary rail.
- **Payments**: queue with status tabs, detail sheet with breakdown + receipt,
  approve dialog with amount/client, reject via menu with reason.
- **Projects**: project detail with facts/tabs (Resumen, Lotes, Medios,
  Instrucciones de pago, Actividad), media manager, CSV import sheet, and bank
  accounts CRUD with one default per project.
- **Users**: one `UserForm` for create/edit, user detail drawer, permissions
  summary; deactivation via `ConfirmDialog`.
- **Analytics**: KPI deltas guarded when the previous period is zero, six data
  surfaces with accessible names, mora card.
- **Audits**: one model filter + one action filter, past-tense translated copy.
- **Settings**: one settings nav (General, Identidad de marca, Perfil,
  Seguridad, Términos) sharing the `SaveBar`.
- **Commissions (new UI over existing data)**: admin report at `/commissions`
  (period, seller filter, KPIs, table, CSV) backed by the existing
  `GET /reports/commissions`; seller read-only view. Rates are per project
  (`commission_rate_direct/_bank/_cash`, editable in the project form) and
  `commission_amount` is frozen when paid. Payout tracking is implemented with
  `commission_paid_at` / `commission_paid_by`, an admin pay endpoint and an
  audit event.
- **Notifications (new UI)**: bell dropdown with unread badge, typed items,
  mark-read and a mobile bell, using the existing endpoints. The former 401 was
  a client hydration race, fixed in the client.
- **Seller collections (new)**: `/vendedor/*` routes behind `SellerRoute`
  (mis clientes, cobros, comisiones, documentos) and a "Registrar cobro" dialog
  that uploads a receipt → `En revisión` (never approves, never moves the
  balance, writes an audit event).
- **Signup** restricted to admin (public account creation stays in the customer
  portal); **onboarding tour** runs once per user; **dark mode** in scope.
- **Removals**: `SidebarV2`, 17 `aria-label="none"`, 9 `window.confirm`,
  `PaginationV2`, `GenericFilter`, `SearchFilterBar`, 7–10px text, dynamic
  Tailwind class maps, the `ModeToggler` class wipe, the duplicate font import.

## Capabilities

### New Capabilities
- `commissions`: admin commission area, payout, rules, and the seller read-only view.
- `navigation-shell`: single navigation, tokens and shared primitives.
- `notifications`: bell dropdown and its API-backed unread list.
- `bank-accounts`: project-scoped accounts with one default.
- `collections`: seller collection queue and the register-collection flow.

### Modified Capabilities
- `contracts`: detail becomes a route, lifecycle/status copy, ledger balance rule.
- `payments`: approval/reject/undo and the detail/approve dialogs.
- `projects`: detail page, media, CSV import and lot detail.
- `users`: create/edit form and deactivation.
- `settings`: consolidated settings navigation and per-section save bar.
- `authentication`: signup is admin-only; reset uses the shared dialog; seller routes.
- `audits`: filter labels and past-tense copy.
- `dashboard`: admin action center and seller home.
- `analytics`: guarded comparison deltas, accessible charts, and a mora card.

## Impact

- **Routing**: `/contracts/:id`, `/vendedor/*` (with `SellerRoute`), `/commissions`.
- **Shared code**: `src/shared/layout/`, `src/shared/ui/`, `src/shared/format` utilities.
- **API**: most endpoints already existed and were verified (commissions report,
  payment accounts, notifications, media, CSV import). Added for this change:
  commission payout (`PATCH /contracts/:guid/commission/pay`, migration 000029)
  and the `UPLOAD_RECEIPT` audit event. Seller clients reuse seller-scoped
  contracts; notification preferences remain future work.
- **Contexts**: `LocaleContext`, `OnboardingContext`, `ThemeContext`.
- **Dependencies**: none new (Font Awesome stays; no `lucide-react`).
- **Design artifacts**: `documentation/design/fintera-redesign.pen` and
  `documentation/design/implementation-map.md` remain the design source of truth.
