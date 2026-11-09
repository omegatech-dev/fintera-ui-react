---
description: Add a reusable shared UI component with a test and export.
agent: build
---

Create a shared UI component named: $ARGUMENTS

1. Read `src/shared/ui/index.js` and a comparable component before editing.
2. Create `src/shared/ui/<Name>.jsx` using function components and Tailwind.
3. Export it from `src/shared/ui/index.js`.
4. Add `src/shared/ui/<Name>.test.jsx` using Vitest + Testing Library and
   extend jest-dom matchers explicitly.
5. Use `LocaleContext` strings when the component renders user-facing text.
6. Run `npm run verify`. Do not commit. Report changed files.
