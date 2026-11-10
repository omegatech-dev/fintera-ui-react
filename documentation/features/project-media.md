# Project media

Project drawings and gallery photos are managed from the project edit page
(`src/features/projects/pages/edit/index.jsx`) by users with the `admin` role.
Lot photos reuse the same gallery from the lot edit page.

## Drawings

`ProjectDrawingsPanel` lists the published CAD plans and exposes upload, edit,
and delete actions. Uploads accept DWG, DXF, PDF, and SVG files up to 50 MB
each. The panel hint describes only those formats.

## Photos

`PhotoGalleryManager` renders the gallery for both projects and lots. When the
user can manage media it also renders `PhotoDropzone`, a drag-and-drop area that
opens the file picker on click or keyboard activation and uploads valid files
as soon as they are selected or dropped.

- Accepted formats: JPEG, PNG, WebP.
- Maximum size: 10 MB per photo.
- Rejected files stay listed with their rejection reason.
- Uploads are sent as `photos[i]` multipart fields to the existing project or
  lot photo endpoint.
- Each photo payload includes a numeric `id` and its `position`; the gallery
  sorts by `position` so the displayed order matches the server. Photos without
  an `id` still render but hide the ID-based actions instead of crashing.
- The gallery uses the `id` for cover, reorder, alt-text, and delete actions.
  The first photo in position order is shown as the cover.

## Shared UI

`MediaSection` is the common card wrapper. It receives the panel-specific
`hint` copy so drawing rules never appear in the photo gallery and photo rules
never appear in the drawings panel.
