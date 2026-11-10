## 1. API helpers and configuration

- [x] 1.1 Add `publish` and `unpublish` calls to `src/features/projects/api.js`.
- [x] 1.2 Add `PUBLIC_PORTAL_URL` to `config.js` from `VITE_PUBLIC_PORTAL_URL` and document it.
- [x] 1.3 Add publish/unpublish/public-link locale keys to `src/locales/en.json` and `src/locales/es.json`.

## 2. Project card

- [x] 2.1 Show a Publicado / No publicado badge on `src/features/projects/components/index.jsx`.
- [x] 2.2 Add publish/unpublish controls for admins and call the new API helpers.
- [x] 2.3 Add the public portal link using the project GUID, with a safe fallback when no portal URL is configured.
- [x] 2.4 Render `cover_photo_url` as the card header image and keep the gradient fallback.

## 3. Project edit page

- [x] 3.1 Track `is_published` in `src/features/projects/pages/edit/index.jsx` and show the current status.
- [x] 3.2 Add a publish/unpublish action that calls the API and updates the page state.

## 4. Tests and docs

- [x] 4.1 Extend the project card tests for badges, toggle calls, portal link, and cover image.
- [x] 4.2 Extend the edit page tests for the visibility toggle.
- [x] 4.3 Update `documentation/features/project-media.md` or add a project publishing doc and link it from the docs index.
- [x] 4.4 Run `npm run lint`, `npm run test:run`, `npm run build`, and `openspec validate add-project-publish-controls --strict`.
