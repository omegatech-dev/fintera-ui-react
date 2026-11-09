## Why

FinteraUI runs on end-of-life tooling: Node 22 is no longer the supported LTS
baseline, the CI matrix pinned Node 23 (EOL), and the build/test stack (Vite 6,
Vitest 3, jsdom 22, Tailwind 3, ESLint 9) is one or more majors behind current
releases. The old dependency tree also carries a large number of known
vulnerabilities and several unused packages, which slows installs and increases
maintenance and security risk.

## What Changes

- **BREAKING** (developer environment): require Node.js 26 LTS. Add `.nvmrc`
  and `.node-version`, raise `engines.node`, and move CI to Node 26.x.
- Upgrade build and test tooling to current majors: Vite 8 (+ Rolldown
  options), `@vitejs/plugin-react` 6, `vite-plugin-pwa` 2,
  `@vite-pwa/assets-generator` 2, Vitest 5, jsdom 31, Testing Library 16/7/10.
- Migrate Tailwind CSS 3 to 4 using `@tailwindcss/vite`, replacing the PostCSS
  pipeline and `@tailwind` directives with `@import "tailwindcss"`, `@config`,
  `@source`, and `@custom-variant dark`.
- Apply Tailwind 4 utility renames across the source tree (`shadow-sm` →
  `shadow-xs` &c.) and replace removed opacity utilities with slash syntax.
- Upgrade runtime majors: React 19, `react-router-dom` 7, `framer-motion` 14,
  Font Awesome 7, `@rollbar/react` 1 + `rollbar` 4, plus current `chart.js`,
  `date-fns`, `driver.js`, `dompurify`, and Quill.
- Migrate ESLint to v10 and drop `eslint-plugin-react`, using only
  `@eslint/js`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`.
- Remove unused dependencies (`swiper`, `@fullcalendar/*`, `jsvectormap`,
  `react-hot-toast`, `baseline-browser-mapping`, `workbox-core`,
  `workbox-precaching`, `autoprefixer`) and regenerate `package-lock.json`.
- Pin `quill@2.0.2` and add a `compression@1.8.2` override to clear the
  high-severity audit findings that remain reachable at current versions.
- Update `AGENTS.md`, `README.md`, `documentation/`, and `openspec/config.yaml`
  to describe the new baseline.

No end-user behavior is intended to change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This change is limited to tooling, dependencies, and documentation; no
spec-level behavior changes. `skip_specs: true` is set in `.openspec.yaml`.

## Impact

- `package.json`, `package-lock.json`, `.nvmrc`, `.node-version`
- `.github/workflows/ci.yml`
- `vite.config.js`, `eslint.config.js`, `tailwind.config.js`,
  `postcss.config.js` (removed)
- `src/index.css`, `src/assets/css/style.css`, and Tailwind utility classes in
  `src/**/*.jsx`
- `src/lib/apiClient.js`, `src/features/users/pages/create/index.jsx`, and
  removed stale `eslint-disable` comments
- Documentation: `README.md`, `AGENTS.md`, `documentation/guides/*`,
  `documentation/architecture/overview.md`, `openspec/config.yaml`
- Developer environments must move to Node 26 LTS. CI uses `npm ci` against the
  regenerated lockfile.
