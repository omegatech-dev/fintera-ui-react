---
description: Scaffold a new feature module (api, pages, components) and wire its route.
agent: build
---

Create a new feature for: $ARGUMENTS

Follow the existing architecture and conventions:

1. Read a comparable feature (for example `src/features/projects` or
   `src/features/contracts`) before editing.
2. Create `src/features/<name>/` with:
   - `api.js` using `apiClient` from `@/lib/apiClient`.
   - `pages/index.jsx` with a lazy-loadable default export.
   - `components/` as needed.
3. Register routes in `src/Router.jsx` under the correct guard
   (`ProtectedRoute`, `AdminRoute`, or `AdminOrOwnerRoute`).
4. Add user-facing strings to `src/locales/en.json` and `src/locales/es.json`
   and use `LocaleContext` when practical.
5. Add tests as `*.test.jsx` next to components or pages.
6. Update `documentation/` and `openspec/specs/<capability>/spec.md` when
   observable behavior changes.

Run `npm run verify`. Do not commit. Report changed files and follow-up work.
