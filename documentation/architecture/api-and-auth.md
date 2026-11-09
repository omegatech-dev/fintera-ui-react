# API and Authentication

## API client

All HTTP calls must go through `src/lib/apiClient.js`. It wraps `fetch` with:

- Base URL from `VITE_API_URL` (`config.js`).
- `Authorization: Bearer <token>` when a token is available.
- JSON request/response handling.
- `FormData` support (the browser sets the multipart boundary; do not set
  `Content-Type` manually).

```js
import { apiClient } from "@/lib/apiClient";

const projects = await apiClient.get("/api/v1/projects");
await apiClient.post("/api/v1/projects", { project: { name: "New" } });
await apiClient.patch("/api/v1/projects/1", { project: { name: "Renamed" } });
await apiClient.delete("/api/v1/projects/1");
```

### Query parameters

The current wrapper does not serialize a `params` option. Build query strings
with `URLSearchParams` and append them to the endpoint:

```js
const params = new URLSearchParams({ page: "1", per_page: "20" });
const data = await apiClient.get(`/api/v1/projects?${params.toString()}`);
```

See `src/features/projects/pages/index.jsx` for an example.

### Response and error shape

- Resolved value is the parsed JSON body (or a `Blob` when
  `responseType: "blob"`).
- Rejected value is an object `{ message, status, errors }`.
- A `401` response dispatches the `auth:unauthorized` window event and rejects
  with `{ message: "Unauthorized", status: 401 }`.

Feature-specific calls belong in `src/features/<domain>/api.js`. For example,
`src/features/contracts/api.js` exposes `contractsApi` methods for listing,
approving, rejecting, and canceling contracts, applying payments, and capital
repayment.

## Authentication

`AuthContext` (`src/contexts/AuthContext.jsx`) owns authentication state:

- Stores `token`, `refresh_token`, and `user` in `localStorage`.
- Decodes the JWT and treats tokens as expired 30 seconds before `exp`.
- Exposes `login`, `logout`, `refresh`, and `setUser`.
- Listens for the `auth:unauthorized` event and logs the user out.
- Mirrors the active token into `apiClient` via `setAuthToken`.

The context value is memoized to avoid unnecessary re-renders.

### Roles

`user.role` is used by the route guards:

| Role | Access |
| --- | --- |
| `admin` | Full access, including admin-only routes |
| `seller` | Authenticated routes; owner-scoped pages |
| `user` | Authenticated routes; own profile and financing |

### Route guards

| Guard | Behavior |
| --- | --- |
| `ProtectedRoute` | Redirects unauthenticated users to `/signin`. If `user.must_change_password` is set, redirects to `/settings/user/:id/security` until the password is changed. |
| `AdminRoute` | Requires `token` and `user.role === "admin"`; otherwise redirects to `/projects`. |
| `AdminOrOwnerRoute` | Allows admins, or the user whose `id` matches the `:userId` route param; otherwise redirects to `/projects`. |

Guards render a loading state while `AuthContext.loading` is true.

## Environment

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Backend API base URL |
| `VITE_APP_ENV` | Environment label |
| `VITE_ROLLBAR_ACCESS_TOKEN` | Optional Rollbar token; enables error reporting when set |
| `VITE_APP_VERSION` | Optional version reported to Rollbar |

`.env` is ignored by git. Never print or commit its values.
