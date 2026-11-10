## Why

Admins can edit project details but have no way to publish or unpublish a
project from the UI. The project list also has no visibility indicator and no
cover image, so cards look identical whether a project is live in the portal or
hidden.

## What Changes

- Add API helpers for the new publish and unpublish endpoints.
- Show a **Publicado / No publicado** badge on every project card.
- Add publish/unpublish toggle buttons on the project card and the project edit
  page for admins.
- Show a public portal link using the project GUID.
- Use the project's `cover_photo_url` as the card header image, falling back to
  the current gradient when the project has no photos.
- Add locale keys and tests for the new card and edit-page behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `projects`: project cards and the edit page expose publishing controls,
  visibility state, a public portal link, and the project cover photo.

## Impact

- `src/features/projects/api.js`
- `src/features/projects/components/index.jsx`
- `src/features/projects/pages/index.jsx`
- `src/features/projects/pages/edit/index.jsx`
- `src/locales/en.json`, `src/locales/es.json`
- Project tests under `src/features/projects/`
- Documentation under `documentation/features/`
- Depends on FinteraAPI `add-project-publish-endpoints` for the routes and the
  `cover_photo_url` response field.
