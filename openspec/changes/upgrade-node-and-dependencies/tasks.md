## 1. Node 26 baseline

- [x] 1.1 Add `.nvmrc` and `.node-version` containing `26`, and set `engines.node` to `>=26.0.0` in `package.json`; verify `node -v` from a Node 26 shell reports v26.
- [x] 1.2 Update `.github/workflows/ci.yml` to `node-version: [26.x]`, `actions/checkout@v5`, `actions/setup-node@v5`, and `npm run test:run`; verify the workflow file parses.
- [x] 1.3 Update Node/version references in `README.md`, `AGENTS.md`, `documentation/guides/development.md`, `documentation/guides/testing.md`, and `documentation/guides/deployment.md`; verify no stale Node 22/23 references remain in `documentation/`.
- [x] 1.4 Remove `node_modules` and `package-lock.json`, then install with Node 26; verify `npm install` completes and `package-lock.json` is regenerated.

## 2. Dependencies, majors, and tooling

- [x] 2.1 Remove unused dependencies (`swiper`, `@fullcalendar/*`, `jsvectormap`, `react-hot-toast`, `baseline-browser-mapping`, `workbox-core`, `workbox-precaching`, `autoprefixer`) and add required peers (`@testing-library/dom`, `workbox-build`, `workbox-window`); verify `npm install` succeeds.
- [x] 2.2 Upgrade Vite 8, `@vitejs/plugin-react` 6, `vite-plugin-pwa` 2, `@vite-pwa/assets-generator` 2, Vitest 5, jsdom 31, and Testing Library 16/7/10; verify `node_modules/.bin/vite --version` and `node_modules/.bin/vitest --version`.
- [x] 2.3 Rename `build.rollupOptions` to `build.rolldownOptions` and `__dirname` to `import.meta.dirname` in `vite.config.js`; verify `npm run build` no longer prints native-config warnings.
- [x] 2.4 Upgrade runtime majors (React 19, `react-router-dom` 7, `framer-motion` 14, Font Awesome 7, `@rollbar/react` 1, `rollbar` 4, `chart.js`, `date-fns`, `driver.js`, `dompurify`, Quill); verify `npm run build` succeeds.
- [x] 2.5 Pin `quill` to `2.0.2` and add the `compression` `1.8.2` override; verify `npm audit --audit-level=high` reports no high/critical findings.

## 3. Tailwind 4

- [x] 3.1 Add `@tailwindcss/vite` to `vite.config.js` and delete `postcss.config.js`; verify the build runs through the Vite plugin.
- [x] 3.2 Replace `@tailwind` directives in `src/index.css` with `@import "tailwindcss"`, `@config`, `@source`, `@custom-variant dark`, and a v3-compatibility `@theme`/base layer; verify `npm run build` succeeds.
- [x] 3.3 Remove `darkMode`/`node_modules` content from `tailwind.config.js` and apply Tailwind 4 utility renames plus slash opacity syntax across `src/**/*.jsx`; verify no removed utility names remain (`shadow-sm`, `blur-sm`, `outline-none`, `flex-shrink`, `*-opacity-*`).
- [x] 3.4 Fix invalid CSS in `src/assets/css/style.css` (`color: #ffffff !;`); verify lightningcss minification succeeds.
- [x] 3.5 Confirm custom colors and dark variants are emitted in `dist/assets/*.css`; verify `bgray` and `.dark` selectors are present.

## 4. ESLint 10

- [x] 4.1 Drop `eslint-plugin-react` and rewrite `eslint.config.js` for ESLint 10 with `@eslint/js`, React Hooks (`rules-of-hooks`, `exhaustive-deps`), and React Refresh; verify `npm run lint` exits 0.
- [x] 4.2 Enable JSX parsing via `parserOptions.ecmaFeatures.jsx`; verify `.jsx` files parse without errors.
- [x] 4.3 Remove stale `eslint-disable` directives and fix the two new findings in `src/features/users/pages/create/index.jsx` and `src/lib/apiClient.js`; verify `npm run lint` reports 0 errors.

## 5. Verification and documentation

- [x] 5.1 Update `AGENTS.md`, `README.md`, `documentation/architecture/overview.md`, and `openspec/config.yaml` to describe React 19, Vite 8, Tailwind 4, ESLint 10, Vitest 5, and Node 26; verify `grep` finds no stale version claims.
- [x] 5.2 Create the OpenSpec change `upgrade-node-and-dependencies` with `skip_specs: true`; verify `openspec validate --change upgrade-node-and-dependencies` passes.
- [x] 5.3 Run `npm run verify` (lint + `vitest run` + build) with Node 26; verify it exits 0.
- [ ] 5.4 Run a manual smoke test of sign-in, dashboard, contracts, payments, projects, users, and settings pages; verify no console errors and styles render.
