## 1. Create form

- [ ] 1.1 Add `city` and `code` state to `src/features/projects/pages/create/index.jsx`.
- [ ] 1.2 Add the inputs next to the address field, using the existing form styles and `t('projects.city')` / `t('projects.code')` labels.
- [ ] 1.3 Include `city` and `code` in the `projectsApi.create` payload (empty → `null`).

## 2. Edit form

- [ ] 2.1 Add `city` and `code` state and prefill from the fetched project in `src/features/projects/pages/edit/index.jsx`.
- [ ] 2.2 Add the inputs to the form and include both in `projectsApi.update`.

## 3. Project card

- [ ] 3.1 Show `city` (fallback to the first address segment) in `src/features/projects/components/index.jsx`.
- [ ] 3.2 Show the project `code` as a chip next to the GUID when present.

## 4. Locales

- [ ] 4.1 Add `projects.city`, `projects.enterCity`, `projects.code` and `projects.enterCode` to `src/locales/es.json`.
- [ ] 4.2 Add the same keys to `src/locales/en.json`.

## 5. Tests

- [ ] 5.1 Extend `src/features/projects/pages/__tests__/Projects.test.jsx` for the create/edit payload and card rendering.
- [ ] 5.2 Add a case where city/code are absent and the card falls back cleanly.

## 6. Verification

- [ ] 6.1 `npm run lint` passes.
- [ ] 6.2 `npm run test` passes.
- [ ] 6.3 `npm run build` passes.
- [ ] 6.4 `openspec validate --changes` passes.
