# Architecture Overview

FinteraUI is a client-rendered React single-page application built with Vite.
It talks to the Fintera backend over a JSON API and is installable as a PWA.

## High-level structure

```
main.jsx
  └─ AuthProvider
      └─ App
          └─ LocaleProvider
              └─ OnboardingProvider
                  └─ ToastProvider
                      └─ ErrorBoundary
                          └─ Router (React Router 7)
                              └─ Layout (sidebar, header)
                                  └─ lazy-loaded feature pages
```

## Feature modules

Domain code lives in `src/features/<domain>/`:

| Feature | Path | Responsibility |
| --- | --- | --- |
| Analytics | `src/features/analytics` | Revenue, distribution, and seller performance views |
| Audits | `src/features/audits` | Audit timeline and details |
| Auth | `src/features/auth` | Sign in, sign up, and auth API calls |
| Contracts | `src/features/contracts` | Contract details, payment schedule, notes, ledger |
| Dashboard | `src/features/dashboard` | Home dashboard and seller view |
| Financing | `src/features/financing` | Financing upload and summary timelines |
| Payments | `src/features/payments` | Payment list, filters, and payment actions |
| Projects | `src/features/projects` | Projects, lots, reservations, and lot CRUD |
| Settings | `src/features/settings` | Personal info, security, and terms |
| Users | `src/features/users` | User list, create, and profile |

Each feature typically contains:

- `api.js` — feature-specific calls built on `apiClient`.
- `pages/` — route-level components, default-exported for lazy loading.
- `components/` — presentational and feature-local UI.
- `hooks/` — feature-specific hooks.

## Shared modules

| Path | Responsibility |
| --- | --- |
| `src/shared/ui` | Reusable UI (GenericList, SearchFilterBar, PaginationV2, charts, ...) |
| `src/shared/api` | Cross-feature API helpers (notifications, reports) |
| `src/shared/auth` | Route guards: ProtectedRoute, AdminRoute, AdminOrOwnerRoute |
| `src/shared/layout` | App shell, sidebar, and header composition |
| `src/shared/forms`, `modals`, `overlays`, `error` | Cross-cutting UI building blocks |
| `src/shared/utils` | Formatters and status helpers |
| `src/lib/apiClient.js` | Fetch wrapper used by all HTTP calls |
| `src/contexts` | Auth, locale, theme, toast, and onboarding providers |
| `src/hooks` | Shared hooks such as `useDebounce` and `usePageTitle` |

## Routing

Routes are declared in `src/Router.jsx` with `createBrowserRouter`. All feature
pages are lazy-loaded with `React.lazy` and wrapped in `Suspense`.

Guards:

- `ProtectedRoute` — requires a valid session; enforces first-login password
  changes.
- `AdminRoute` — requires the `admin` role.
- `AdminOrOwnerRoute` — allows admins or the user identified by `:userId`.

See [API and auth](api-and-auth.md) for details.

## State and data flow

```
Page/component
  └─ feature api.js
      └─ apiClient (src/lib/apiClient.js)
          └─ fetch(VITE_API_URL + endpoint)
```

- There is no global data store. State is local to pages/components, with
  cross-cutting state held in React contexts.
- Auth state is owned by `AuthContext`; token changes are mirrored into
  `apiClient` with `setAuthToken`.
- A `401` response dispatches `auth:unauthorized` on `window`; `AuthContext`
  listens for it and logs the user out.

## Build and PWA

`vite.config.js` configures:

- Path aliases: `@`, `@config`, `@auth`.
- Manual vendor chunking to keep React in a single `vendor` chunk.
- `vite-plugin-pwa` with `autoUpdate`, offline precaching, and a short-lived
  `NetworkFirst` cache for GET API responses.

## Documentation and specs

- This folder: architecture, guides, features, and QA.
- `openspec/specs/`: behavior contracts (source of truth for requirements).
