# Redesign implementation map

How the Pencil redesign becomes code: tokens, primitives, routes, component
trees, and a migration order.

- **Design source of truth:** `./fintera-redesign.pen`
  (frames `00`–`23`, plus detail sheets and mobile variants).
- **This document:** the bridge between those frames and `src/`.
- **Not a spec:** observable behavior still lives in `openspec/specs/`. Where
  the redesign changes behavior (validation, contract lifecycle copy, payment
  approval), an OpenSpec change is required before implementation.

Status legend: **reuse** (exists, restyle only), **refactor** (exists, split or
rewrite), **new** (does not exist).

---

## 1. Target architecture

```
App
└─ AppShell (new, replaces Layout + SidebarV2 + HeaderOne/Two duplication)
   ├─ Sidebar        ← one nav config, role-filtered
   ├─ PageHeader     ← title/subtitle from route, breadcrumbs, actions slot
   ├─ <Outlet />
   └─ ToastProvider / DialogProvider (new)
```

- `src/routes.jsx` keeps the flat child routes under one layout route; guards
  stay `AdminRoute` / `AdminOrOwnerRoute`.
- `ProtectedRoute` is currently only used in tests — do not add it to routes.
- Navigation moves to `src/shared/layout/nav.js`:

```js
export const NAV = [
  { to: "/", labelKey: "nav.dashboard", icon: "layout-dashboard", roles: ["admin", "seller"] },
  { to: "/contracts", labelKey: "nav.contracts", icon: "file-text", roles: ["admin", "seller"] },
  { to: "/payments", labelKey: "nav.payments", icon: "wallet", roles: ["admin", "seller"] },
  { to: "/commissions", labelKey: "nav.commissions", icon: "percent", roles: ["admin"] },
  { to: "/projects", labelKey: "nav.projects", icon: "building-2", roles: ["admin", "seller"], match: ["/projects/"] },
  { to: "/users", labelKey: "nav.users", icon: "users", roles: ["admin"] },
  { to: "/analytics", labelKey: "nav.analytics", icon: "chart-column", roles: ["admin"] },
  { to: "/audits", labelKey: "nav.audits", icon: "history", roles: ["admin"] },
  { to: "/docs", labelKey: "nav.docs", icon: "book-open", roles: ["admin", "seller"] },
  { to: "/settings/general", labelKey: "nav.settings", icon: "settings", roles: ["admin"] },
];
```

- Active state uses prefix matching (`match` entries), so `/projects/:id/lots`
  keeps **Proyectos** highlighted.
- One sidebar at all widths: rail ≥1024, drawer <1024, bottom bar <768
  (see mobile frames). Delete `SidebarV2`.

### Roles, guards and permissions

Add **`SellerRoute`** alongside the existing guards. Same shape as `AdminRoute`
(loading → 401 → role check → `ForbiddenPage`), but it allows `admin` **and**
`seller`. All three guards share one shell so the loading/401 behavior stays
identical.

| Capability | admin | seller | customer (`user`) |
| --- | --- | --- | --- |
| Dashboard (admin) / Mi día (seller) | ✅ | ✅ (own) | → portal |
| Contratos — listar / ver | ✅ | ✅ | — |
| Contratos — aprobar / cancelar / reabrir | ✅ | ❌ | — |
| Pagos — ver | ✅ | ✅ | — |
| Pagos — aprobar / rechazar / deshacer | ✅ | ❌ | — |
| Cobros — registrar comprobante (seller) | ✅ | ✅ (propios) | — |
| Proyectos + Lotes — ver / crear / editar | ✅ | ✅ (crear/ver) | — |
| Reserva (crear contrato) | ✅ | ✅ | — |
| Usuarios | ✅ | ❌ (usa `/vendedor/clientes`) | — |
| Analítica / Auditoría | ✅ | ❌ | — |
| Comisiones — ver | ✅ | ✅ (propias) | — |
| Comisiones — pagar / reglas | ✅ | ❌ | — |
| Configuración / Identidad de marca | ✅ | ❌ | — |
| Guía | ✅ | ✅ | — |

Notes:

- `/users` stays `AdminRoute`. The seller's "Mis clientes" is **not** a relaxed
  `/users`; it is a dedicated `/vendedor/clientes` route filtered server-side
  (`my_clients=1`).
- "Pagar comisión" and "Configurar tasas" are admin-only (frame 22); the seller
  sees 21d read-only.
- "Cobrar" (seller, frame 21c-bis) only registers a proof → `En revisión`;
  it never approves and never changes a balance.

---

## 2. Tokens

Add to `src/index.css` under `@theme`, override in `.dark`. Tailwind v4 emits
utilities that reference these variables, so a `.dark` override is enough.

### Color

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--color-canvas` | `#F6F7F9` | `#0B1220` | page background |
| `--color-surface` | `#FFFFFF` | `#111827` | cards, sheets |
| `--color-surface-2` | `#F8FAFC` | `#0F172A` | inset panels, dropzones |
| `--color-line` | `#E5E9F0` | `#1F2937` | borders, dividers |
| `--color-line-strong` | `#CBD5E1` | `#334155` | input borders |
| `--color-ink` | `#0F172A` | `#F8FAFC` | primary text (16.1:1) |
| `--color-ink-2` | `#475569` | `#CBD5E1` | secondary text |
| `--color-ink-3` | `#64748B` | `#94A3B8` | muted text (4.8:1 min) |
| `--color-brand` | `#15803D` | `#15803D` | primary button (5.0:1 on white) |
| `--color-brand-strong` | `#166534` | `#16A34A` | hover / active text |
| `--color-brand-soft` | `#DCFCE7` | `#052E16` | selected nav, positive chips |
| `--color-danger` | `#B91C1C` | `#FCA5A5` | overdue text |
| `--color-danger-soft` | `#FEE2E2` | `#450A0A` | danger chip |
| `--color-warning` | `#B45309` | `#FBBF24` | due-soon text |
| `--color-warning-soft` | `#FEF3C7` | `#451A03` | warning chip |
| `--color-info` | `#1D4ED8` | `#93C5FD` | approval text |
| `--color-info-soft` | `#DBEAFE` | `#172554` | info chip |
| `--color-violet` | `#6D28D9` | `#C4B5FD` | reservations |
| `--color-violet-soft` | `#EDE9FE` | `#2E1065` | reservation chip |

Deprecate the old names (`success-300` `#22C55E`, `bgray-*`, `primary`) for new
work. `bgray-500` (`#A0AEC0`, 2.3:1) must not be used for text — that is the
single largest contrast failure in the app.

### Type, radius, elevation

```css
@theme {
  --text-micro: 11px;   --text-micro--line-height: 14px;
  --text-label: 12px;   --text-label--line-height: 16px;
  --text-body: 13px;    --text-body--line-height: 18px;
  --text-body-lg: 14px; --text-body-lg--line-height: 20px;
  --text-title: 16px;   --text-title--line-height: 22px;
  --text-section: 18px; --text-section--line-height: 24px;
  --text-page: 26px;    --text-page--line-height: 32px;
  --text-display: 30px; --text-display--line-height: 36px;

  --radius-chip: 6px;
  --radius-control: 10px;
  --radius-card: 14px;
  --radius-sheet: 16px;

  --shadow-pop: 0 10px 24px #0f172a1f;
}
```

- Font stays **Urbanist** (already loaded). Drop the second Google Fonts import
  and the Poppins family; self-host woff2 in `public/fonts` (decision 5).
- Spacing uses the Tailwind 4px scale; the mocks only use 4/8/12/16/20/24/32/40.
- Minimum text size is **11px**, and 11px is only for uppercase micro-labels.

---

## 3. Primitives

All land in `src/shared/ui/` and are exported from `index.js`.
`reuse` = wire the mock to an existing component; otherwise it is new code.

| Pencil component | Target file | Variants / props | Replaces |
| --- | --- | --- | --- |
| Button/Primary…Danger | `Button.jsx` | `variant`, `size` (md 44 / sm 34), `iconOnly` (requires `aria-label`), `loading` | ad-hoc button classes in every feature |
| IconButton | `Button.jsx` (`iconOnly`) | `aria-label` required by prop check | 32px icon buttons, `title`-only actions |
| Chip/Success…Neutral | `Chip.jsx` | `tone`: success/warning/danger/info/neutral/violet | `formatStatus` + inline color classes |
| Field/Default…Disabled | `Field.jsx` | `label`, `hint`, `error`, `required`, `disabled`; wires `aria-describedby` + `aria-invalid` | per-form label/error markup |
| Input / Select | `Input.jsx`, `Select.jsx` | 44px tall, 16px text on mobile (no iOS zoom), native `<select>` | `GenericFilter`, `SearchFilterBar` dropdowns |
| Card | `Card.jsx` | `title`, `action`, `bodyClassName` | duplicated `bg-white … rounded-2xl` |
| KpiCard | `KpiCard.jsx` | `label`, `value`, `caption`, `tone` | `StatsGrid`, dashboard stat markup |
| Banner | `Banner.jsx` | `tone`, `action` | inline alert divs |
| EmptyState | `EmptyState.jsx` | `variant="empty" \| "no-results"`, `icon`, `title`, `description`, `action` | `GenericList` empty block, projects empty block |
| ErrorState | `ErrorState.jsx` | `title`, `description`, `onRetry` | raw API messages, blank screens |
| Skeleton | `Skeleton.jsx` | `rows`, `variant` | spinners in lists |
| Dialog | `Dialog.jsx` | `open`, `onClose`, `title`, `description`, `size`; portal, `role="dialog"`, `aria-modal`, Esc, focus trap, scroll lock, restore focus, single-instance guard | 6 hand-rolled overlays |
| ConfirmDialog | `ConfirmDialog.jsx` | `tone`, `confirmLabel`, `objectName` | 9 `window.confirm` calls |
| Tabs | `Tabs.jsx` | `items[]`, `value`, `onChange`; roving tabindex, arrows, `aria-selected` | local tab buttons |
| Table | `Table.jsx` | `columns[]`, `rows[]`, `getRowKey`, `sort`, `onSortChange`, `mobileCard` | `GenericList` desktop table + users divs |
| Pagination | `Pagination.jsx` | `page`, `pageCount`, `total`, `perPage`, `onPageChange`; `aria-current` | `PaginationV2`, inline page strings |
| Menu | `Menu.jsx` | `trigger`, `items[]`; Esc, arrows, click-outside | row action popovers |
| Toggle | `Toggle.jsx` | `checked`, `onChange`, `label`; `role="switch"` | raw switches in settings |
| FileUpload | `FileUpload.jsx` | `accept`, `maxSize`, `files`, `onChange`, `hint` | 4 dropzones |
| Stepper | `Stepper.jsx` | `steps[]`, `current`; `aria-current="step"` | — (reserve wizard) |
| SegmentedControl | `SegmentedControl.jsx` | `options[]`, `value`; `role="radiogroup"` | financing-type tabs |
| Toast | `Toast.jsx` (refactor) | provider + `useToast`; `aria-live="polite"` | current single-mount toast |
| SaveBar | `SaveBar.jsx` | `dirty`, `onSave`, `onDiscard`; generalizes `SettingsSaveBar` | per-form footers |

Notes

- `Dialog` must be the only overlay implementation. `PaymentData`,
  `PaymentScheduleModal`, `LotDetailsModal`, `PasswordResetModal`,
  `LoginTermsModal` and `CommissionsModal` migrate to it.
- `Table` renders a semantic `<table>` ≥768px and cards below, killing the
  current div-based lists in Users.
- Icon strategy: keep **Font Awesome** for this migration and map the Lucide
  names used in the mocks. Adding `lucide-react` is a new dependency and needs
  its own change (AGENTS.md).

---

## 4. Screen map

Guards: **A** = `AdminRoute`, **AO** = `AdminOrOwnerRoute`, **S** = `SellerRoute`
(new), **P** = public.

### Frame inventory

Canonical numbering (`.pen` frames). Mobile frames were renumbered `M1`/`M2`
to stop clashing with `04 Contratos`.

`00 Componentes` · `01 Dashboard` · `01b Dashboard estados` · `02 Reserva (paso 2)`
· `02b Reserva recorrido` · `03 Contrato` · `03b Contrato pestañas` ·
`03c Contrato libro mayor` · `03d Contrato documentos` · `03e Contrato acciones`
· `04 Contratos` · `M1 Móvil dashboard` · `M2 Móvil reserva` · `05 Proyectos` ·
`05b Proyecto detalle` · `05c Proyecto instrucciones` · `05d Cuenta bancaria` ·
`05e Proyecto medios` · `05f Importar CSV` · `06 Análisis` · `07 Usuarios` ·
`07b Usuario editar` · `07c Usuario detalle` · `07d Usuario nuevo` · `08 Pagos` ·
`09 Configuración general` · `09b Marca` · `09c Seguridad` · `09d Perfil` ·
`09e Términos` · `10 Lotes` · `11 Lote detalle` · `12 Pago detalle` ·
`13 Contrato pagos y documentos` · `14 Acceso` · `14b Signup` ·
`14c Recuperar contraseña` · `15 Proyecto formulario` · `16 Estados y errores` ·
`17 Tokens y modo oscuro` · `18 Móvil contrato` · `20 Auditoría` ·
`21 Vendedor` · `21b Vendedor clientes` · `21c Vendedor cobros` ·
`21c-bis Registrar cobro` · `21c-ter Estado en revisión` · `21d Vendedor comisiones`
· `21e Vendedor documentos` · `22 Admin comisiones` · `22b Reglas de comisión` ·
`23 Notificaciones`

| Frame | Route | Guard | Page entry | Key components |
| --- | --- | --- | --- | --- |
| 01 | `/` | A | `features/dashboard/pages/index.jsx` | `AdminDashboard`, `AttentionCard`, `CollectionsTable`, `MonthSummary`, `RecentActivity` |
| 01b | *(states of 01)* | A | same | `EmptyState`, `ErrorState`, `Skeleton`, `NotificationsPopover`, focus/hover states |
| 02 | `/projects/:id/lots/:lot_id/contracts/create` | AO | `features/projects/pages/reserve/index.jsx` | `ReserveWizard`, `StepLotClient`, `StepPlan`, `StepDocuments`, `SummaryRail`, `reserveRules.js` |
| 02b | *(steps 1 & 3 of 02)* | AO | same | `StepLotClient`, `StepDocuments`, `SubmitStates` (loading/success/error) |
| 03 | `/contracts/:id` *(new)* | A | `features/contracts/pages/ContractDetail.jsx` *(new)* | `ContractHeader`, `ContractKpis`, `ContractTabs`, `StatusBanner` |
| 03b | *(tab states of 03)* | A | same | `CronogramaTab`, `ApproveDialog`, `RationaleCard` |
| M1 | *(mobile of 01)* | A | same | 1-col attention cards, bottom nav, `CobrosList` |
| M2 | *(mobile of 02)* | A | same | sticky summary sheet + step form |
| 03c | `/contracts/:id?tab=pagos` | A | same | `LedgerTable`, `AccountSummary`, `ContractNotes` |
| 03d | `/contracts/:id?tab=documentos` | A | same | `DocumentChecklist`, `FileUpload`, `DocumentPreview` |
| 03e | *(action sheet)* | A | `components/ContractActionsSheet.jsx` *(new)* | `Menu` items + `ConfirmDialog` |
| 04 | `/contracts` | A | `features/contracts/pages/index.jsx` | `ContractKpis`, `ContractFilters`, `ContractTable`, `ContractRow` |
| 05 | `/projects` | AO | `features/projects/pages/index.jsx` | `ProjectFilters`, `ProjectCard` (`components/index.jsx`), `Pagination`, `EmptyState` |
| 05b | `/projects/:id` *(new)* | AO | `features/projects/pages/detail/index.jsx` *(new)* | `ProjectHeader`, `ProjectFacts`, `ProjectTabs`, `AvailabilityCard`, `ProjectMetaCard` |
| 05c | `/projects/:id/payment-instructions` | AO | `features/projects/pages/paymentInstructions/index.jsx` | `ProjectTabs`, `BankAccountsCard`, `PaymentInstructionsEditor`, `ClientPreviewCard` |
| 05d | *(sheet on 05c)* | AO | `features/projects/components/BankAccountSheet.jsx` *(new)* | bank, type, currency, number, holder, default toggle |
| 06 | `/analytics` | A | `features/analytics/pages/index.jsx` | `StatsGrid`→`KpiCard`, `RevenueTrendChart`, `DistributionChart`, `SellerPerformance` |
| 07 | `/users` | A | `features/users/pages/index.jsx` | `UserFilters`, `UserTable`, `UserRow`, `Menu` |
| 07b | `/users/:id/edit` *(new)* | A | `features/users/pages/edit/index.jsx` *(new)* | `UserForm`, `RoleSelect`, `SecurityPanel`, `PermissionsCard`, `SaveBar` |
| 07c | *(drawer on 07)* | A | `components/UserDetailSheet.jsx` *(new)* | profile, contacts, contracts, activity, actions |
| 07d | `/users/create` | A | `features/users/pages/create/index.jsx` | same `UserForm` in create mode |
| 08 | `/payments` | A | `features/payments/pages/index.jsx` | `PaymentKpis`, `PaymentTabs`, `PaymentTable`, `PaymentRow`, `PaymentDetailSheet` |
| 10 | `/projects/:id/lots` | AO | `features/projects/pages/lots/index.jsx` | `LotFilters`, `LotCard`, `LotStatusChip`, `EmptyState` |
| 11 | *(drawer on 10)* | AO | `features/projects/components/lots/LotDetailsSheet.jsx` *(new)* | stats grid, owner block, actions, documents |
| 12 | *(drawer on 08)* | A | `features/payments/components/PaymentDetailSheet.jsx` *(new)* | breakdown, receipt preview, `ApprovePaymentDialog` |
| 13 | `/contracts/:id` tabs | A | `features/contracts/components/tabs/PagosTab.jsx`, `DocumentosTab.jsx` | ledger table, document checklist, `FileUpload` |
| 14 | `/signin` | P | `features/auth/pages/signin/index.jsx` | `BrandPanel`, `LoginForm` |
| 15 | `/projects/create`, `/projects/:id/edit` | AO | `features/projects/pages/create|edit` | `ProjectForm`, `PublishPanel`, `SaveBar` |
| 16 | *(system)* | — | `shared/ui/EmptyState`, `ErrorState`, `ForbiddenPage`, `shared/error/NotFound` | states used by every page |
| 17 | *(system)* | — | `src/index.css`, `tailwind.config.js` | tokens |
| 18 | mobile of 03 | A | same as 03 | sticky CTA, 2×2 KPIs |
| 20 | `/audits` | A | `features/audits/pages/index.jsx` | `AuditFilters`, `AuditEvent`, `AuditTimeline` |
| 21 | `/` seller | S | `features/dashboard/pages/SellerDashboard.jsx` | `TodayQueue`, `CommissionCard`, `SellerKpis` |
| 21b | `/vendedor/clientes` *(new)* | S | `features/seller/pages/clients/index.jsx` *(new)* | `SellerClientTable`, `ClientFilters` |
| 21c | `/vendedor/cobros` *(new)* | S | `features/seller/pages/collections/index.jsx` *(new)* | `CollectionKpis`, `CollectionTabs`, `CollectionTable` |
| 21c-bis | *(sheet on 21c)* | S | `features/seller/components/RegisterCollectionSheet.jsx` *(new)* | amount, method, date, reference, receipt, notice |
| 21c-ter | *(state of 21c-bis)* | S | same | `EnRevisionChip`, `InfoNotice` |
| 21d | `/vendedor/comisiones` *(new)* | S | `features/seller/pages/commissions/index.jsx` *(new)* | `CommissionKpis`, `CommissionTable` |
| 21e | `/vendedor/documentos` *(new)* | S | `features/seller/pages/documents/index.jsx` *(new)* | `DocumentGrid`, `DocumentCard` |
| 22 | `/commissions` *(new)* | A | `features/commissions/pages/index.jsx` *(new)* | `CommissionKpis`, `CommissionFilters`, `CommissionTable`, `CommissionRulesSheet` |
| 22b | *(sheet on 22)* | A | `features/commissions/components/CommissionRulesSheet.jsx` *(new)* | default rate, payment rule, per-seller exceptions |
| 05e | `/projects/:id?tab=medios` | AO | `features/projects/pages/detail/MediaTab.jsx` *(new)* | `PhotoGrid`, `PlansList`, `DocumentList`, `FileUpload` |
| 05f | *(sheet on `/projects`)* | AO | `features/projects/components/ProjectImportSheet.jsx` *(new)* | dropzone, import toggles, column mapping |
| 09 | `/settings/general` | A | `features/settings/pages/admin/index.jsx` | `SettingsNav`, `GeneralSettingsForm`, `SaveBar` |
| 09b | `/settings/branding` | A | `features/branding/pages/general.jsx` | `LogoUploadCard`, `BrandPreview` |
| 09c | `/settings/user/:id/security` | AO | `features/settings/pages/security/index.jsx` | `ChangePasswordForm`, `SessionsList` |
| 09d | `/settings/user/:id` | AO | `features/settings/pages/personal-info/index.jsx` | `ProfileForm`, `SaveBar` |
| 09e | `/settings/terms` | A | `features/settings/pages/terms&condition/index.jsx` | `TermsEditor`, `TermsPreview` |
| 14b | `/signup` | A (or removed) | `features/auth/pages/signup/index.jsx` | `BrandPanel`, `SignUpForm` |
| 14c | *(sheet on signin)* | P | `features/auth/components/ForgotPasswordSheet.jsx` *(new)* | email field, send-link |
| 23 | *(bell dropdown)* | all | `shared/header/NotificationsPopover.jsx` *(new)* | `NotificationList`, `NotificationItem`, filter + mark-read |

### 01 — Dashboard (admin)

- `AdminDashboard` composes: attention row → collections table → rail summary.
- Data: add `GET /dashboard/summary` if the backend allows; otherwise compose
  `paymentsApi`, `contractsApi`, `projectsApi`, `auditsApi` with `Promise.allSettled`
  and render per-card `ErrorState` instead of a blank page.
- `AttentionCard` is a link (`to` + `count`), never a static number.
- Remove: hardcoded "system status", the marketing banner, the `Access` label.

### 02 — Reservation wizard

- Split the 1,123-line page into `ReserveWizard` + 3 steps + `SummaryRail` +
  `useReserveForm` (state, derived totals, submit).
- Step 1 owns lot + client and **validates the client** (`applicant_user_id` or
  the new-user fields). Today `handleSubmit` never validates it.
- Step 2 keeps live totals; field errors replace `errors.join(". ")`.
- Step 3 collects documents; submit is disabled until required docs exist.
- Success navigates to the lot list with a toast that links to the contract.

### 03 — Contract detail
- Convert the modal into a **route** `/contracts/:id` (deep-linkable, kills the
  modal-stacking and focus-trap class of bugs). Keep a `ContractDrawer` only if
  product insists on in-list preview.
- Tabs are nested routes or local state; `Cronograma` replaces
  `PaymentScheduleModal`, `Pagos` replaces `LedgerEntriesTab`.
- **Pagos (03c)** is the ledger: posted entries move the balance, scheduled
  entries show `—` and never alter it. Row `Resumen de cuenta` shows
  total/pagado/ajustes/saldo, with notes alongside.
- **Documentos (03d)** is a required-document checklist (2 of 3), the missing
  document flagged, upload and preview/replace.
- **Actions (03e)** live behind the header overflow: solicitante, lote,
  registrar pago, editar, descargar, recordatorio, reabrir, cancelar (danger,
  with consequence copy).
- Money copy: `Saldo` is always positive; an overpayment renders
  "Saldo a favor" — never `-385,000.00`.
- The status banner is derived from one status map (approved/active, closed,
  cancelled), not three literals.

### 04 — Contracts list

- `/contracts` is the missing list: KPI strip that **reconciles** (15 = 11
  aprobados + 0 pendientes + 4 cancelados), status chips with counts, and a table
  where the **contract number is the identifier** (`#16`) with the lot as context.
- Removes the old `SYS-AUTH // uuid` line, the duplicated "Todos los Estados"
  label, the US date inputs and the per-card eye/schedule icons.
- Rows link to `/contracts/:id`; the row menu holds cancel/reopen, and paying
  stays in the detail screen.

### 05 / 10 — Projects and lots

- `ProjectCard` exists (`features/projects/components/index.jsx`) — restyle,
  keep the photo carousel logic.
- **05b** adds the missing project home at `/projects/:id`: header with status,
  facts strip (código, ubicación, entrega, lotes), tabs (Resumen, Lotes, Medios,
  Instrucciones de pago, Actividad), description, availability, recent activity,
  ficha (tipo, unidad, precio/m², moneda, estado) and documents.
- **05c Instrucciones de pago** is the bank-accounts surface: list of accounts
  (bank, type, masked number, currency), one marked as *predeterminada*, the
  customer-facing instructions editor, and a live client preview. Accounts are
  project-scoped and only one can be default; the preview is exactly what the
  customer portal and the reservation email render.
- **05d** creates/edits an account (bank, type, currency, number, holder,
  default). Deleting an account that is default requires choosing a new default.
- `LotCard` replaces `LotItem`; `LotStatusChip` maps status → tone.
- Filters: `Select` + `SearchInput`, not `GenericFilter`'s `<li>` list.
- Keep `window.confirm` only until `ConfirmDialog` lands (PR2), then delete.

### 06 — Analytics

- Keep Chart.js; wrap every chart in a `ChartCard` with `aria-label` and a
  visually hidden data table. Fix the delta calculation (`previous = 0` →
  "sin datos del mes anterior", not `+100%`).
- The screen carries six data surfaces, each mapped to a component:
  tendencia de ingresos (`RevenueTrendChart`), disponibilidad
  (`DistributionChart`), rendimiento mensual (`MonthlyPerformance`),
  rendimiento por vendedor (`SellerPerformance`), crecimiento por proyecto
  (`GrowthByProject`, new) and the mora card (`MoraCard`, new). The mora card
  links to `/payments?status=overdue`.
- Remove the stuck `Cargando…` and the duplicated section headings.

### 07 — Users

- `UserTable` uses `Table` (semantic `<th>`), role chips in Spanish, last-access
  column via `formatDate`, row `Menu`.
- Detail stays a `Drawer` on desktop, full-screen sheet on mobile.
- **07b / 07d** are one `UserForm` in two modes: edit (prefilled, security
  panel) and create (placeholders, temporary password or email invitation).
  Sections: datos personales, acceso y rol, seguridad, notas internas and
  notificaciones. Layout is a single fill form column plus one 340px rail
  (avatar, permisos, actividad) — never more than one rail.
- The current 656-line `users/pages/create/index.jsx` and the inline edit logic
  in `UserData`/`RightSidebar` collapse into this form.
- Deleting a user moves from `window.confirm` to `ConfirmDialog` naming the
  user, and deactivation is the default action (delete is admin-only).

### 08 / 12 — Payments

- `PaymentTable` + `PaymentRow` replace `PaymentItem`'s table markup; extract
  `usePaymentActions` (approve/reject/undo, optimistic patch) out of the
  1,061-line component.
- `PaymentDetailSheet` + `ApprovePaymentDialog` replace the inline
  approve/reject. Reject moves into the row menu → confirm with reason.

### 13 — Contract ledger and documents

- `PagosTab` reuses `Table`; `DocumentosTab` reuses `FileUpload` and shows the
  missing-document state from frame 13.
- Note: frame `13` is the **compact consolidated view** (ledger + documents in
  one panel). It is not a separate route from `03c`/`03d`; treat it as a
  reference composition for the same tab.

### 14 — Auth

- Rebuild `LoginForm` on `Field` + `Button`, keep `resolvePostLoginDestination`.
- Remove the duplicate legal link, re-enable zoom, set the document title per
  route.
- Password reset and terms modals migrate to `Dialog`.

### 15 — Project create/edit

- Shared `ProjectForm` with sections; `SaveBar` shows dirty state and keeps the
  submit disabled until valid.
- Fields: nombre, código, precio por m², moneda, total de lotes, ubicación, tipo,
  fecha de entrega, unidad de medida and descripción. This matches the fields
  the API already accepts; missing ones become defaults, not empty inputs.
- `PublishPanel` owns the publish toggle and explains the consequence of
  unpublishing (customers lose visibility).

### 16 — States

- `EmptyState` takes `variant` so "no data" (first run, with CTA) is never
  confused with "no results" (with clear-filters).
- `ErrorState` always has retry; `ForbiddenPage` keeps the customer-portal
  fallback.

### 20 — Audits

- One model filter + one action filter (they currently share a label).
- Event copy: actor + past-tense verb + object, all translated. Remove the
  `SYS-AUTH`-style identifiers and English action keys.

### 21 — Seller
- `SellerDashboard` gets its own composition; treat `dashboardApi` as the data
  source and keep `conversion_rate` guarded (`?? 0`).
- The seller area needs its own routes (`/vendedor/...`): the current `/users`
  page is `AdminRoute`, so "Mis clientes" cannot reuse it without relaxing a
  guard. Add the new `SellerRoute` for `/vendedor/*`; this is a behavior change
  and needs an OpenSpec proposal.
- **21b Mis clientes** filters to `my_clients=1` server-side, shows lot/contract,
  next payment and status, and opens the client drawer.
- **21c Cobros** is the seller's collection queue: today/overdue tabs, a single
  `Cobrar` action per row (uploads proof or records cash), and read-only
  approval state.
- **21d Comisiones** is read-only: month total, amount pending, paid history,
  5% rule explained in the subtitle.
- **21e Documentos** is the sales kit (price list, contract template, guide,
  policy) with download links and an updated date.

---

### 22 — Admin commissions

- New admin area (`/commissions`), visible only to `admin`; the seller version
  (21d) is read-only for that seller.
- KPIs: comisiones del mes, por pagar, pagado en el año, tasa promedio.
- The table is the management surface: seller, contract, amount, %, commission,
  status, and one action per row (`Pagar` for pending, `Ver` for paid). Paying
  marks the commission as paid and writes an audit entry — it does not touch the
  contract balance.
- **22b Reglas de comisión** opens from `Configurar tasas`: default rate,
  payment trigger, and per-seller exceptions. Changes apply to **new contracts**
  only; existing contracts keep their rate. Every change is audited.
- Commission is computed when a contract is approved and stored on the contract,
  so later rate changes never rewrite history.

### 09 / 09b–09e — Settings

- One `SettingsNav` (General, Identidad de marca, Perfil, Seguridad, Términos)
  replaces the duplicated admin/personal sidebars. Each section is its own
  screen sharing the shell: General (identidad, soporte, reservas, regional,
  notificaciones), Branding (logos + live preview), Seguridad (change password +
  sessions), Perfil (personal data) and Términos (editor + preview).
- Every settings screen ends in the shared `SaveBar`; dirty state is tracked per
  section, not globally.

### 05e — Project media

- `MediaTab` manages photos (grid with cover marker), planos and documents.
  Reuses `FileUpload`; deletes go through `ConfirmDialog` naming the file.

### 05f — CSV import

- `ProjectImportSheet`: dropzone + template download, two toggles (update
  existing, skip duplicates), a column-mapping preview, and the import count in
  the CTA. This is where the import options that used to clutter the projects
  page live.

### 14b / 14c — Signup and reset

- **14b** is admin-only (decision 8): public account creation lives in the
  customer portal; back-office accounts are created via `/users/create` (07d).
  Keep the frame only if an admin self-registration flow is wanted — otherwise
  drop `/signup`.
- **14c** (reset sheet) is a single-email form with a send-link action. Both use
  `Field` + `Button`.

### 23 — Notifications

- `NotificationsPopover` is the bell dropdown: unread badge, Todas/No leídas
  filter, typed items (aprobación pendiente, cuota vencida, pago aprobado,
  nueva reserva) with an unread marker, "Marcar leídas" and a footer to the full
  list + preferences.
- Requires fixing the current 401 on `notificationsApi`; the bell must exist on
  mobile too (today `HeaderTwo` has none).

## 5. Route changes

| Change | Reason |
| --- | --- |
| Add `/contracts/:id` (+ optional `/contracts/:id/:tab`) | Contract detail is a page, not a modal |
| Add `/commissions` (admin) and `/vendedor/...` (seller) | Commissions become a first-class area, split by role |
| Keep `/payments`, add `?status=overdue` deep links | Action center must link to filtered lists |
| Keep `/projects/:id/lots` and add `/projects/:id/lots?status=available` | Attention links |
| `usePageTitle` covers every route, including `/projects/:id/lots` and the reserve route | Today both render "Dashboard" |
| `document.title` follows route + branding | Today it is static |
| Guard `/docs` remains AO; `/financing/user/:userId` remains A | Unchanged behavior |

---

## 6. Migration plan

Each PR keeps `npm run verify` green and ships behind the existing routes.

**PR 0 — tokens + focus**
`index.css` tokens, `.dark` overrides, `:focus-visible` ring, remove zoom
restrictions, remove the duplicate font import. No visual refactors yet.

**PR 1 — shell**
`AppShell`, `nav.js`, `Sidebar` rewrite, `PageHeader`, delete `SidebarV2`, fix
active matching and the 640–768px drawer conflict. Update `Layout.test` (if
present) and `Router.test`.

**PR 2 — primitives I**
`Button`, `Field`, `Input`, `Select`, `Card`, `Chip`, `Banner`, `EmptyState`,
`ErrorState`, `Skeleton`, `SaveBar`. Replace `window.confirm` with
`ConfirmDialog` in the same PR (it depends only on `Dialog`).

**PR 3 — primitives II**
`Dialog`, `Tabs`, `Table`, `Pagination`, `Menu`, `Toggle`, `FileUpload`,
`Stepper`, `SegmentedControl`, `Toast` provider. Migrate the five hand-rolled
modals.

**PR 4 — lists**
Projects, Lots, **Contracts**, Users, Payments, Audits consume `Table`/`Card` +
`Pagination` + `EmptyState`. Ships the user form (07b/07d) and the users list.
Delete `PaginationV2`, `GenericFilter`, `SearchFilterBar`.

**PR 5 — dashboard**
Admin action center + seller home. New dashboard data composition or endpoint.

**PR 6 — contract + project**
`/contracts/:id` route + tabs + payment sheet/approve dialog. Project detail
(05b), payment instructions + bank accounts (05c/05d), media (05e) and CSV
import (05f).

**PR 7 — reservation**
Wizard extraction + validation. This is the highest-risk PR; add tests for each
step and for the "client required" rule.

**PR 8 — auth, settings, docs, states**
Sign-in rebuild, **signup restricted to admin (or `/signup` removed)**, token
pass on settings/docs, 403/404, route titles.

**PR 9 — responsive**
Mobile/tablet layouts per frame `M1/M2/18`, bottom bar, 44px targets.

**PR 10 — settings, commissions, notifications**
`SettingsNav` + the five settings sections (general, marca, perfil, seguridad,
términos), the admin commissions area (22/22b) and `NotificationsPopover` (with
the API fix). This is also where the onboarding tour is rewritten to run once
per user or dropped, and the PWA manifest is corrected.

**PR 11 — dark mode + performance**
Dark variants for every token/screen (the frames are light-only today), drop the
duplicate font import, self-host fonts, subset Font Awesome, split
framer-motion/chart.js/quill, and set a bundle budget. Verify Lighthouse on
dashboard, contracts and payments.

---

## 7. Removals

- `src/shared/sidebar/SidebarV2.jsx` and the duplicate `<aside>` in `Layout`.
- `aria-label="none"` (17 instances) — replace with real names or remove.
- `window.confirm` (9 instances) — `ConfirmDialog`.
- `src/shared/ui/PaginationV2.jsx`, `src/shared/ui/SearchFilterBar.jsx`,
  `src/shared/forms/GenericFilter.jsx`.
- Dynamic Tailwind maps: `QuickActionCard.jsx`, `payments/pages/index.jsx`
  (`bg-${card.color}-500`), `users/components/RightSidebar.jsx`.
- `src/shared/header/ModeToggler.jsx` class wipe
  (`document.querySelector("html").classList = theme`).
- 7–10px type and `text-bgray-500` for text.
- `t(key) || "Fallback"` patterns; `t()` already returns the key.

---

## 8. Accessibility contract

Every primitive and screen must satisfy:

- **Focus:** `:focus-visible` → `outline: 2px solid var(--color-brand); outline-offset: 2px`.
  Never `outline: none` without a replacement.
- **Targets:** 44×44 minimum for interactive controls, including the mobile
  drawer toggle (currently 16×40).
- **Zoom:** no `user-scalable=no`; `maximum-scale` ≥ 5.
- **Dialogs:** `role="dialog"`, `aria-modal`, `aria-labelledby`, Esc, focus
  trap, restore focus, scroll lock, one dialog at a time.
- **Tabs:** `role="tablist"/"tab"/"tabpanel"`, arrow keys, `aria-selected`.
- **Tables:** real `<th scope="col">`, `aria-sort` on sortable headers,
  cards below 768px.
- **Pagination:** `aria-current="page"`, "Mostrando X–Y de Z".
- **Charts:** `role="img"` + `aria-label` + hidden data table.
- **Contrast:** text ≥ 4.5:1 (3:1 for ≥24px), UI borders ≥ 3:1. `#A0AEC0` on
  white (2.2:1) is not allowed.
- **Language:** `<html lang>` follows `LocaleContext`; `document.title` follows
  route + branding.
- **Motion:** respect `prefers-reduced-motion` for dialogs, steppers and toasts.

---

## 9. Formatting and copy

Extend `src/shared/utils/formatters.js` (no new parallel module) with:

- `formatCurrency(value, { currency, locale, compact })` — `L 188,750`,
  compact `L 1.99M`; never string-replace `$`.
- `formatDate(value, { locale, timeZone, style })` — `01 dic 2026`,
  `martes, 10 de noviembre de 2026`.
- `maskPhone`, `formatPercent` (one decimal), `formatCount`.

Copy rules:

- Spanish default, `<html lang="es">` when the locale is `es`.
- Actions are verbs in infinitive ("Registrar pago"), events are past tense
  ("aprobó", "canceló").
- Destructive confirms name the object and the amount.
- Empty vs no-results copy is distinct (frame 16).

---

## 10. Decisions (resolved)

1. **Contract detail = route** `/contracts/:id` (deep-linkable; no modal stacking).
2. **Users detail = drawer** (full-screen sheet on mobile).
3. **`GenericList` stays** for simple lists (docs, audits); `Table` for money
   lists (payments, contracts, users).
4. **Icons = Font Awesome** for this migration (map the Lucide names in the
   mocks; no new dependency).
5. **Fonts = Urbanist only**, self-hosted woff2 (400/500/600/700); drop Poppins
   and both `@import` Google Fonts lines (one in `index.css`, one in `style.css`).
6. **Dashboard data = client composition first**; `GET /dashboard/summary` as a
   fast-follow once the backend exposes it.
7. **OpenSpec required** for reserve validation, contract lifecycle copy, payment
   approval, commission rules and seller "Cobrar".
8. **Signup = admin-only**; the customer portal owns public account creation.
   Back-office accounts are created via `/users/create` (07d), so `/signup` is
   guarded `AdminRoute` or removed.
9. **Customer portal = out of scope** for this app.
10. **Dark mode = in scope** for v1 (PR 11).
11. **Onboarding tour = rewrite** to run once per user (PR 10).

---

## 11. API and data (verified)

Verified against the Go backend while shipping PR 6–11. Most of what the
redesign needs already exists; only the last rows are genuinely missing.

| Area | Status | Contract |
| --- | --- | --- |
| Dashboard | Implemented | no `/dashboard/summary`; client composition of `payments/stats` + `contracts/stats` |
| Commissions | Existing | `GET /reports/commissions`, `GET /reports/commissions_csv` (admin sees all; seller filtered by creator) |
| Commission rates | Existing | `commission_rate_direct` / `_bank` / `_cash` on Project, editable in project create/edit |
| Commission amount | Existing | `commission_amount` on Contract, computed and stored at approval |
| Commission payout | **Missing** | no paid/status endpoint; the report is read-only |
| Bank accounts | Existing | `/projects/:id/payment-instructions` CRUD + reorder |
| Notifications | Existing | `/notifications`, `mark_all_as_read`, `:id/mark_as_read`; the 401 was a frontend hydration race, fixed |
| Media | Existing | project photos/drawings endpoints |
| CSV import | Existing | `POST /projects/import` |
| Users | Existing | CRUD + invitation/resend; no seller client-listing endpoint |
| Seller collections | **Missing** | no register-collection endpoint; would reuse payment upload |
| Commission payout history | **Missing** | — |

Notes:

- No schema migration is needed for v1: commission rates and amounts already
  exist on project and contract.
- Remaining backend work: commission payout, seller collections, notification
  preferences.
- The dashboard's ideal fourth card (reservas sin contrato) still needs a count
  field or query; the shipped screen uses the four metrics the API exposes.

## 12. Out of scope / pending

Status per item (some were designed this pass, others remain open):

| Item | Status |
| --- | --- |
| Medios (05e) | **Designed** — ships in PR 6 |
| Importar CSV (05f) | **Designed** — ships in PR 6 |
| Signup (14b, admin-only) + reset (14c) | **Designed** — ships in PR 8; public signup is the portal's job |
| Financing / resumen del cliente | **Out of scope** — external customer portal (`CUSTOMER_PORTAL_URL`) |
| Coming soon | **Drop the route** or leave as-is; not redesigned |
| Tour (onboarding) | **Pending decision** — rewrite once-per-user or remove (PR 10) |
| Notificaciones (backend) | **Fixed** — the 401 was a client hydration race, not a missing endpoint (PR 10) |
| Dark pass | **Pending work** — PR 11 |
| PWA / manifest | **Pending work** — correct name, `lang`, theme-color (PR 10) |
| Print / "Descargar PDF" | **Not designed** — needs a print stylesheet decision |
| Performance | **Pending work** — PR 11 |

## Definition of done (per screen)

- Matches the frame at 1440px and 390px.
- Every state drawn in frame `16` exists in code (empty, no-results, error,
  loading).
- Keyboard-only pass: tab order, Esc, arrows, focus visible.
- Contrast and target-size checks pass.
- Strings in `en.json` + `es.json`; dates/currency via the formatters.
- Unit test for the screen's main action + one failure path.
- `npm run verify` green.
