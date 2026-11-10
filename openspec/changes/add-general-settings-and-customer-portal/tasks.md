## 1. General settings

- [x] 1.1 Add the settings API wrapper.
- [x] 1.2 Add the "Soporte y reservas" form with validation and toasts.
- [x] 1.3 Render it on the branding/general settings page.
- [x] 1.4 Add ES/EN locale keys.

## 2. Customer boundary

- [x] 2.1 Add the customer portal notice with `VITE_CUSTOMER_PORTAL_URL`.
- [x] 2.2 Block the `user` role in `ProtectedRoute`.
- [x] 2.3 Document the environment variable.

## 3. Tests

- [x] 3.1 Settings form loads, saves and rejects invalid input.
- [x] 3.2 `ProtectedRoute` shows the notice for customers and keeps sellers.

## 4. Verification

- [x] 4.1 `npm run lint`
- [x] 4.2 `npm run test:run`
- [x] 4.3 `npm run build`
- [x] 4.4 `openspec validate --changes`
