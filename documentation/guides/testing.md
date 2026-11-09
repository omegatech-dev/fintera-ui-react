# Testing Guide

## Stack

- **Vitest 5** with `jsdom` 31
- **@testing-library/react** and `@testing-library/user-event`
- **@testing-library/jest-dom** matchers

## Running tests

```bash
npm run test       # watch mode
npm run test:run   # single run (CI)
```

The test environment is `jsdom`, configured through the scripts in
`package.json`.

## Test location

Place tests next to the code:

```
src/features/contracts/components/PaymentScheduleModal.test.jsx
src/shared/ui/GenericList.test.jsx
src/features/users/pages/Users.perf.test.jsx
```

`__tests__/` directories are also used in some features.

## Test setup

Vitest loads `src/test/setup.js` (configured in `vite.config.js`). It installs
in-memory `localStorage` and `sessionStorage` implementations because Node 22+
(including Node 26) exposes an experimental global `localStorage` that can
shadow jsdom's storage and is unusable without `--localstorage-file`.

This project does **not** use the setup file for jest-dom. Import and extend
the matchers explicitly in each test file:

```js
import * as matchers from "@testing-library/jest-dom/matchers";
expect.extend(matchers);
```

## Mocking

Mock the API client and contexts as needed:

```js
vi.mock("../../lib/apiClient", () => ({
  apiClient: {
    get: vi.fn(() => Promise.resolve({ items: [], total: 0 })),
  },
}));

vi.mock("../../contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key }),
}));
```

Prefer testing observable behavior (rendered output, user interactions,
navigation) over implementation details.

## Performance and benchmark tests

Some tests assert on render counts or timing (for example
`src/lib/apiClient.perf.test.js`, `src/shared/layout/Layout.perf.test.jsx`,
and `src/features/dashboard/components/RecentActivity.benchmark.test.js`).
Keep them passing; if a change affects performance, update the benchmark
intentionally rather than deleting it.

## CI

`.github/workflows/ci.yml` runs `npm ci`, `npm run lint`, `npm run test`, and
`npm run build` on pushes and pull requests targeting `main`.
