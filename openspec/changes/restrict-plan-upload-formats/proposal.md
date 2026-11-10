## Why

The customer portal now renders plan files directly (SVG/PNG/JPG/PDF) instead of
using a 3D SDK, and DWG/DXF files cannot be rendered in the browser. The admin
upload still accepts `.dwg` and `.dxf`, so admins can publish plans customers
can only download, never view.

## What Changes

- Restrict project plan uploads to browser-renderable formats:
  `.svg`, `.png`, `.jpg`, `.jpeg` and `.pdf`.
- Reject `.dwg` and `.dxf` with the existing "unsupported type" message.
- Update the upload hint copy and the file validation tests.
- Keep existing DWG/DXF drawings visible and downloadable; only new uploads are
  restricted.

## Capabilities

### New Capabilities

- `project-plan-formats`: which plan files the admin can upload for the customer
  portal.

### Modified Capabilities

None.

## Impact

- `src/features/projects/components/media/mediaFiles.js`
- `src/features/projects/components/media/mediaFiles.test.js`
- `src/features/projects/components/media/ProjectDrawingsPanel.test.jsx` (if it
  asserts accepted formats)
- `src/locales/es.json`, `src/locales/en.json` (`media.hint`)
- Pairs with FinteraWeb `replace-smplrspace-with-plan-viewer`.
