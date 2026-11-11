## Context

The branding page is the existing admin "general app configuration" screen. The
API now exposes `GET /api/v1/settings` (public) and `PUT /api/v1/settings`
(admin). `ProtectedRoute` currently allows every authenticated role.

See `proposal.md` and
`openspec/changes/add-general-settings-and-customer-portal/specs/admin-general-settings/spec.md`.

## Goals / Non-Goals

**Goals:**

- One place for support contact and hold duration.
- Keep admin/seller flows untouched.
- Send customers to the right app with a clear explanation.

**Non-Goals:**

- A new sidebar section; the form lives on the existing general/branding page.
- Per-project settings.
- Managing customer reservations from the admin app.

## Decisions

### Form on the branding page

The branding page is already the deployment-wide configuration screen. Adding a
"Soporte y reservas" card avoids duplicating the two sidebar implementations and
keeps related settings together.

### Guard at ProtectedRoute

Blocking the `user` role in `ProtectedRoute` covers every customer-accessible
route with a single change. The notice links to `VITE_CUSTOMER_PORTAL_URL` and
explains that reservations/payments moved to FinteraWeb.

## Risks / Trade-offs

- **Customers with an existing admin-app session** see the notice on the next
  navigation instead of the previous pages. That is the intended consolidation.
- **The portal URL is build-time**. Each environment sets
  `VITE_CUSTOMER_PORTAL_URL`.

## Migration Plan

Deploy the API settings endpoint first, then this UI. No data migration.
