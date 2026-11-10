## Why

FinteraAPI is gaining admin-managed `city` and `code` fields on projects so the
customer portal's directory can filter by city and display a project code. The
admin UI has no way to set or edit those values, so every project would show a
null city/code until someone updates the database directly.

## What Changes

- Add a `city` input and a `code` input to the project create form.
- Add the same inputs to the project edit form, including prefill from the API
  and inclusion in the update payload.
- Show the city (falling back to the address) and the project code on the
  admin project card.
- Add the `projects.city`, `projects.enterCity`, `projects.code` and
  `projects.enterCode` keys to both locale files.
- Cover the new fields with the existing project page tests.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `project-management`: admins can create and edit a project's city and code,
  and see them in the project list.

## Impact

- `src/features/projects/pages/create/index.jsx`
- `src/features/projects/pages/edit/index.jsx`
- `src/features/projects/components/index.jsx`
- `src/locales/en.json`, `src/locales/es.json`
- `src/features/projects/pages/__tests__/Projects.test.jsx`
- Depends on FinteraAPI `add-public-project-discovery-fields`. The fields are
  optional, so the UI keeps working before the API change is deployed.
