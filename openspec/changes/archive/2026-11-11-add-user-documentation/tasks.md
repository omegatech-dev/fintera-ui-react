## 1. OpenSpec and dependencies

- [x] 1.1 Add the `add-user-documentation` change (proposal, design, tasks, spec).
- [x] 1.2 Install `react-markdown`, `remark-gfm`, `rehype-slug`, and `fuse.js`.

## 2. Documentation data layer

- [x] 2.1 Add `src/features/docs/data/manifest.js` with sections, articles, per-locale titles, order, and `audience`.
- [x] 2.2 Add `src/features/docs/content/index.js` (Vite raw markdown loader) and `src/features/docs/hooks/useDocs.js` (locale + role filtering, article lookup, search index).
- [x] 2.3 Author bilingual markdown articles under `src/features/docs/content/en/` and `src/features/docs/content/es/` for getting started, projects/lots, contracts, payments, customers/credit, reports, administration, and glossary.

## 3. Reader UI

- [x] 3.1 Add `MarkdownViewer` (react-markdown + GFM + slugs + Tailwind element map, no raw HTML).
- [x] 3.2 Add `TableOfContents` (reads rendered h2/h3 ids) and `DocsSearch` (fuse.js).
- [x] 3.3 Add `DocsSidebar` (sections/articles, active state, search) and `pages/index.jsx` (two-column layout, article selection, empty state).

## 4. Routing, sidebar, i18n

- [x] 4.1 Register lazy `/docs` and `/docs/:slug` routes wrapped in `AdminOrOwnerRoute` in `src/routes.jsx`.
- [x] 4.2 Add a Guide entry to `Sidebar.jsx` and `SidebarV2.jsx` for admin and seller.
- [x] 4.3 Add `docs.*` and `header.pageTitle.docs` keys plus `/docs` handling in `usePageTitle.js` to `en.json` and `es.json`.

## 5. Tests and documentation

- [x] 5.1 Add tests for `MarkdownViewer`, `TableOfContents`, `useDocs` (role/locale filtering), and the docs page (search, navigation, seller filtering).
- [x] 5.2 Add `documentation/features/user-documentation.md` and link it from `documentation/README.md`.

## 6. Verification

- [x] 6.1 `npm run verify` (lint, tests, build) passes.
- [x] 6.2 `openspec validate --changes` passes.
