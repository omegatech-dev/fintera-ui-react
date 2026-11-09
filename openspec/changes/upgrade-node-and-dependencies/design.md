## Context

See `proposal.md` for motivation. The repository is a JavaScript-only Vite SPA
with a single `package-lock.json` (npm). Local development previously mixed
pnpm-style `node_modules` with an npm lockfile, and the CI matrix ran Node 23
while the code targeted Node 22.

Constraints that shape the approach:

- No TypeScript, no new state/UI libraries; dependency-only upgrade.
- `eslint-plugin-react@7` does not support ESLint 10, and `react/prop-types`
  is not enforced by the project, so the plugin can be dropped.
- Tailwind 4 replaces the PostCSS plugin with a dedicated Vite plugin and
  changes several utility names and the default ring/border/button styles.
- Vitest 5 requires Node `^22.12 || ^24 || >=26`, so Node 26 is a hard
  prerequisite for the test tooling.
- `tailwind-datepicker-react` ships Tailwind 3 class names; it must keep working
  through Tailwind 4 or be replaced.

## Goals / Non-Goals

**Goals:**

- Move the whole repository to Node 26 LTS with a single, reproducible lockfile.
- Land all major upgrades in one PR without changing observable app behavior.
- Keep `npm run verify` green and reduce audit findings to only those without a
  non-breaking fix.

**Non-Goals:**

- Redesigning features, routes, or API contracts.
- Migrating to TypeScript.
- Splitting the upgrade across phased releases.
- Replacing `tailwind-datepicker-react` unless it actually breaks.

## Decisions

### Node 26 + single npm lockfile

Add `.nvmrc`/`.node-version` (`26`) and `engines.node` `>=26.0.0`; CI uses
`26.x` and `npm ci`. Delete `node_modules` and `package-lock.json`, then run
`npm install` with Node 26 to produce a clean tree.

Alternative: keep Node 22 and stay on Vitest 3/jsdom 22. Rejected because it
keeps EOL tooling and browserslist/storage workarounds alive.

### Tailwind 4 via `@tailwindcss/vite`

`vite.config.js` adds `tailwindcss()` and removes the PostCSS config. The
`@tailwind` directives become `@import "tailwindcss"` plus `@config` for the
existing JS theme, `@source` for `tailwind-datepicker-react`, and
`@custom-variant dark` to keep the class-based dark mode. A compatibility
`@theme`/`@layer base` block restores v3 defaults (ring width/color, default
border color, pointer cursor, placeholder color).

Utility renames are applied mechanically (`shadow-sm` → `shadow-xs`, `blur-sm`
→ `blur-xs`, `outline-none` → `outline-hidden`, `flex-shrink` → `shrink`,
`flex-grow` → `grow`). Removed opacity utilities are replaced with slash
notation (`bg-opacity-30` → `bg-black/30`).

The `and` operator in `tailwind.config.js` requires the JS config path;
`content` no longer needs `node_modules` because `@source` handles that.

### Vite 8 / Rolldown

`build.rollupOptions` is renamed to `build.rolldownOptions`. `__dirname` is
replaced with `import.meta.dirname` to satisfy Vite's native config loader.

### ESLint 10 without `eslint-plugin-react`

The flat config keeps `@eslint/js/recommended`, React Hooks, and React Refresh.
`react-hooks` is registered manually with only `rules-of-hooks` (error) and
`exhaustive-deps` (warn); the new React Compiler rules in
`recommended-latest` flag pre-existing patterns and are out of scope. JSX
parsing is enabled explicitly via `parserOptions.ecmaFeatures.jsx`.

Alternative: adopt the full `react-hooks` recommended set and refactor 23
effects. Rejected as unrelated scope creep.

### Runtime majors

React 19 is a drop-in for the current `createRoot` entry point. React Router 7
keeps the existing `createBrowserRouter`/`RouterProvider` API. Font Awesome 7
and `@rollbar/react` 1 / `rollbar` 4 are imported through the same entry points.
Quill is pinned to `2.0.2` because `2.0.3` has an unresolved XSS advisory.

### Audit overrides

`compression` is overridden to `1.8.2` to clear the high-severity DoS advisory
pulled in transitively by `serve`. Remaining advisories are in ESLint's
dependency graph or Workbox's optional build tooling and have no non-breaking
fix at current versions.

## Risks / Trade-offs

- **Tailwind 4 visual drift** → Compatibility `@theme`/base layer, mechanical
  class renames, and a production build check that custom `bgray` colors and
  dark-mode variants are still emitted.
- **Datepicker incompatibility** → Keep `tailwind-datepicker-react` and scan it
  with `@source`; replace with a native date input only if it breaks.
- **React 19 runtime changes** (propTypes ignored, stricter effects) → Tests and
  a manual smoke test of dashboard, contracts, payments, users, and settings.
- **Vitest 5 behavior changes** (`mockReset`/`clearMocks`, benchmark API) →
  Run the full suite and adjust spies/mocks where needed.
- **Lockfile churn** → Regenerated once from a clean tree; CI uses `npm ci` to
  detect drift.

## Migration Plan

1. Merge the harness/base PR first; this upgrade is stacked on it.
2. Developers run `nvm use` (Node 26) and `npm ci`.
3. Deploy as a normal static build; roll back by reverting the upgrade commit
   and reinstalling from the previous lockfile.
4. No data or API migration is required.
