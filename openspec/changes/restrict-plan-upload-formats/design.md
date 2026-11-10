## Context

`mediaFiles.js` defines `DRAWING_ACCEPT = ".dwg,.dxf,.pdf,.svg"` and validates
extensions against `["dwg", "dxf", "pdf", "svg"]`. The admin panel shows the
matching hint in `media.hint`.

The portal's new plan viewer supports SVG, PNG, JPG/JPEG and PDF only.

See `proposal.md` and
`openspec/changes/restrict-plan-upload-formats/specs/project-plan-formats/spec.md`.

## Goals / Non-Goals

**Goals:**

- Align the upload contract with what the portal can actually render.
- Reject unsupported files before the request reaches the API.
- Keep the existing 50 MB limit and the current UI flow.

**Non-Goals:**

- Server-side validation changes; the API keeps accepting the files the UI
  sends.
- Converting or deleting existing DWG/DXF drawings.
- Supporting CAD parsing in the browser.

## Decisions

### Drop CAD formats at the client boundary

The API and storage are format-agnostic, so restricting the accepted extensions
in the admin is enough to stop new DWG/DXF uploads. Existing rows keep their
`file_type` and remain downloadable.

### Accept PDF alongside images

PDFs are plan files customers can view natively in the browser, so they stay in
the accepted set even though they are not images.

## Risks / Trade-offs

- **Admins who relied on DWG uploads must export to SVG/PDF first.** For an
  interactive plan the export is required anyway; the hint explains the accepted
  formats.
- **Existing DWG drawings cannot be previewed.** They remain downloadable and
  can be replaced by an exported SVG/PDF.

## Migration Plan

No data migration. Deploy with the portal viewer change.
