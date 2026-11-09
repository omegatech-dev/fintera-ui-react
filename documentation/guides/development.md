# Development Guide

## Prerequisites

- Node.js `>=26` LTS (CI uses 26.x; see `.nvmrc`)
- npm
- Access to the Fintera backend API

## Setup

Use the Node version in `.nvmrc` (Node 26 LTS), for example with `nvm use`.

```bash
npm install
```

Create a local `.env` (ignored by git):

```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_APP_ENV=development
# Optional
# VITE_ROLLBAR_ACCESS_TOKEN=
# VITE_APP_VERSION=
```

Start the dev server:

```bash
npm run dev
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest watch mode |
| `npm run test:run` | Vitest single run |
| `npm run verify` | `lint` + `test:run` + `build` |
| `npm start` | Serve the built `dist/` |
| `npm run audit:ci` | High-severity dependency audit |

Run `npm run verify` before opening a pull request.

## Continuous integration

`.github/workflows/ci.yml` runs lint, tests, and the production build as three
parallel jobs (a matrix with `fail-fast: false`) to keep feedback fast and
failures isolated:

- Runs on pull requests to **any** base branch (including stacked PRs) and on
  pushes to `main`, with `workflow_dispatch` for manual runs.
- Cancels superseded runs for the same PR and uses a 10-minute timeout per job.
- Draft PRs skip CI until marked **Ready for review**.
- PRs that only touch Markdown, `documentation/`, or `openspec/` skip the heavy
  steps; a docs-only message is still reported by each job.
- Each job uses the Node version from `.nvmrc`, npm's download cache, and
  `npm ci --prefer-offline --no-audit --no-fund`.
- Uses read-only `contents` permission.

## Path aliases

Configured in `vite.config.js`:

- `@` → `src`
- `@config` → `config.js`
- `@auth` → `auth.js`

Prefer the `@` alias for imports inside `src/`.

## Adding a feature

Use the `/new-feature` opencode command, or follow the manual path:

1. Read a comparable feature (for example `src/features/projects`).
2. Create `src/features/<domain>/` with `api.js`, `pages/`, and `components/`.
3. Add routes in `src/Router.jsx` with the correct guard.
4. Add translations to both locale files.
5. Add tests next to the code.
6. Update `documentation/` and `openspec/specs/` when behavior changes.

## Adding a shared component

Use `/new-component`, or:

1. Create `src/shared/ui/<Name>.jsx`.
2. Export it from `src/shared/ui/index.js`.
3. Add `<Name>.test.jsx` with Testing Library.

## Conventions

- Function components and hooks only.
- Keep domain code in `src/features/<domain>/`; move generic pieces to
  `src/shared/`.
- Let routes lazy-load pages.
- Use `apiClient` for HTTP; never call `fetch` directly in components.
- Use `LocaleContext` for user-facing strings.
- Do not add comments unless they explain non-obvious behavior.

## Agent harness

| Path | Purpose |
| --- | --- |
| `AGENTS.md` | Canonical instructions for AI coding agents |
| `opencode.json` | project config: instructions and doc references |
| `.opencode/commands/` | opencode slash commands (`verify`, `new-feature`, `new-component`, `docs-sync`, OpenSpec `opsx-*`) |
| `.opencode/skills/` | opencode skills, including the PR helper |
| `.agents/skills/`, `.agents/rules/` | shared agent skills and rules |
| `openspec/` | behavior specs and change workflow |

## Git workflow

- Branch from `main` using a descriptive prefix (`feature/`, `fix/`, `chore/`).
- Commit with Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`,
  `test:`, `chore:`, `perf:`, `build:`, `ci:`.
- Never commit `.env` or secrets.
- Do not commit unless explicitly asked.
