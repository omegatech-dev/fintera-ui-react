## Why

The edit-project screen is hard to use: the save/back actions appear before the
media sections, photo uploads require an unclear three-button sequence that
often appears to do nothing, and the media hint mixes drawing and photo rules in
both panels. Admins need the primary actions at the end of the page and a
single, obvious way to add photos.

## What Changes

- Move the **Back** and **Save changes** actions to the very end of the project
  edit page, after the payment-instructions link and the drawings and photos
  panels.
- Replace the photo upload buttons and hidden file inputs with a drag-and-drop
  photo zone that also opens the file picker on click, validates JPEG/PNG/WebP
  files up to 10 MB, and uploads as soon as files are selected or dropped.
- Remove the separate "Thumbnails" step from the project and lot photo gallery;
  the API treats thumbnails as optional and the current index pairing is
  unreliable.
- Give each media panel its own hint: drawings show only the DWG/DXF/PDF/SVG
  (50 MB) rules and the photo gallery shows only the JPEG/PNG/WebP (10 MB)
  rules.
- Review the related lot flows and remove duplicate top-of-page save actions
  on the lot create and edit screens so the pattern is consistent.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `projects`: project editing places its primary actions at the end of the page
  and the project media panels expose scoped upload rules and drag-and-drop
  photo uploads.

## Impact

- `src/features/projects/pages/edit/index.jsx`
- `src/features/projects/pages/lots/edit/index.jsx`
- `src/features/projects/pages/lots/create/index.jsx`
- `src/features/projects/components/media/PhotoGalleryManager.jsx`
- `src/features/projects/components/media/ProjectPhotosPanel.jsx`
- `src/features/projects/components/media/LotPhotosPanel.jsx`
- `src/features/projects/components/media/MediaSection.jsx`
- `src/features/projects/components/media/ProjectDrawingsPanel.jsx`
- `src/features/projects/components/media/mediaFiles.js` (rule copy helper)
- `src/locales/en.json`, `src/locales/es.json`
- Project media tests under
  `src/features/projects/components/media/`
- `documentation/features/project-media.md`, `documentation/README.md`
- No API contract changes; the existing `POST /projects/{id}/photos` and
  `POST /projects/{id}/lots/{lot_id}/photos` multipart endpoints are reused.
