# AGENTS.md

Instructions for AI coding agents working in the FinteraUI repository.

## Project

FinteraUI is a React 18 + Vite 6 single-page PWA for managing real-estate
financing: projects, lots, contracts, payment schedules, payments, users,
audits, analytics, financing uploads, and settings.

- **Language:** JavaScript / JSX (no TypeScript).
- **Node:** `>=22` (CI uses 23.x).
- **Styling:** Tailwind CSS.
- **Routing:** React Router 6 (`src/Router.jsx`).
- **Tests:** Vitest 3 + jsdom + Testing Library.
- **Lint:** ESLint 9 flat config (`eslint.config.js`).

## Commands

```bash
npm install        # install dependencies
npm run dev        # Vite dev server
npm run build      # production build
npm run preview    # preview production build
npm run lint       # ESLint
npm run test       # Vitest (watch mode)
npm run test:run   # Vitest single run
npm run verify     # lint + test:run + build
```

Always run `npm run verify` before reporting a task complete. If a check cannot
run, report the exact command and the failure.

## Repository layout

```
src/
  features/<domain>/     # domain code: api.js, pages/, components/, hooks/
  shared/
    api/                 # shared API helpers
    auth/                # ProtectedRoute, AdminRoute, AdminOrOwnerRoute
    layout/              # app shell
    ui/                  # reusable UI components (exported via index.js)
    utils/               # formatters and helpers
    ...                  # forms, modals, overlays, error, buttons, header, sidebar
  contexts/              # AuthContext, LocaleContext, ThemeContext, ToastContext, OnboardingContext
  hooks/                 # shared hooks (useDebounce, usePageTitle)
  lib/apiClient.js       # fetch wrapper used by all HTTP calls
  locales/               # en.json, es.json
  Router.jsx             # route table (pages are lazy-loaded)
  App.jsx, main.jsx      # app composition and entry point
documentation/           # architecture, guides, feature docs, QA
openspec/                # OpenSpec specs and changes (source of truth for behavior)
```

Path aliases (configured in `vite.config.js`):

- `@` → `src`
- `@config` → `config.js`
- `@auth` → `auth.js`

## Conventions

- Use function components and hooks. Do not introduce class components.
- Keep feature code inside `src/features/<domain>/`; move generic pieces to `src/shared/`.
- Routes live in `src/Router.jsx`; pages are lazy-loaded and wrapped in the
  appropriate route guard (`ProtectedRoute`, `AdminRoute`, `AdminOrOwnerRoute`).
- Export shared UI components through `src/shared/ui/index.js`.
- Prefer Tailwind utility classes; follow existing component styling.
- Do not add comments unless they explain non-obvious behavior.
- Do not introduce TypeScript, a new state library, or a new UI library without
  an OpenSpec change.
- Follow the existing ESLint rules; `react/react-in-jsx-scope` and
  `react/prop-types` are disabled, and unused vars are warnings.
- Use the `@` alias for imports inside `src/` where possible.

### Internationalization

Add internationalization to each new user-facing string when practical. Use
`LocaleContext` and keys in `src/locales/en.json` / `src/locales/es.json`.
See `.agents/rules/internationalization.md`.

## API layer

- All HTTP calls must go through `src/lib/apiClient.js`
  (`apiClient.get/post/put/patch/delete`).
- Feature-specific calls belong in `src/features/<domain>/api.js`.
- A `401` response dispatches the `auth:unauthorized` window event; do not add
  ad-hoc redirects.
- `FormData` bodies are supported for uploads; do not set `Content-Type`
  manually for them.
- Base URL comes from `VITE_API_URL` via `config.js`.

## Testing

- Place tests next to the code as `*.test.jsx` (or `__tests__/`).
- Use Vitest + `@testing-library/react`.
- Import and extend jest-dom matchers explicitly:

  ```js
  import * as matchers from "@testing-library/jest-dom/matchers";
  expect.extend(matchers);
  ```

- Mock `src/lib/apiClient` and contexts (e.g. `LocaleContext`) as needed.
- Performance/benchmark tests exist; keep them passing.

## Documentation

- `documentation/` holds architecture, guides, feature docs, and QA scenarios.
  Start at `documentation/README.md`.
- Update the relevant doc when behavior, conventions, commands, or structure change.
- Documentation is written in English; the root `README.md` remains in Spanish
  for end users. Add Spanish translation notes where helpful.

## OpenSpec

Behavior contracts live in `openspec/specs/<capability>/spec.md`. Use OpenSpec
for non-trivial changes:

```bash
openspec list                 # active changes
openspec validate --specs     # validate specs
```

Typical flow (opencode commands):

- `/opsx-propose "<idea>"` or `/openspec-propose "<idea>"` — create a change with proposal, specs, design, tasks.
- `/opsx-apply` — implement the tasks.
- `/opsx-archive` — archive a completed change.

When behavior changes, update the matching capability spec or add one through a
change. Do not invent requirements solely to satisfy validation; use
`skip_specs` for pure refactors, tooling, or docs.

## Guardrails

- Never commit secrets. `.env` is ignored; do not print or commit its values.
- Never commit unless the user explicitly asks.
- Keep changes scoped; do not refactor unrelated code.
- Run `npm run verify` before finishing.
- Use Conventional Commits when committing (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
