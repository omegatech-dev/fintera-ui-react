## Context

See `proposal.md` — Why. The project edit page (`pages/edit/index.jsx`) renders
the form action row before an external `<ProjectDrawingsPanel>` and
`<ProjectPhotosPanel>`, so the primary actions are visually mid-page. The photo
gallery (`components/media/PhotoGalleryManager.jsx`) uses two hidden file inputs
and three separate buttons (upload, thumbnails, send); selecting files has no
visible effect until the separate send button is pressed, and thumbnail indices
do not reliably match the selected photos. `MediaSection` renders the single
`media.hint` key for every panel, which mixes drawing and photo rules. Lot edit
at `pages/lots/edit/index.jsx` repeats the same actions in its header and footer.

## Goals / Non-Goals

**Goals:**

- Make the end of the project edit page the single place for Back and Save.
- Make photo uploads one obvious action with drag-and-drop and click-to-pick.
- Keep validation client-side (type and size) before any request is sent.
- Scope each panel's guidance copy to the media it accepts.
- Reuse the photo gallery for both project and lot photos.
- Keep the existing multipart API calls and response handling unchanged.

**Non-Goals:**

- Changing the API upload contract or adding thumbnail generation.
- Reworking the drawings uploader into a drop zone.
- Redesigning the whole project edit page.
- Adding new libraries.

## Decisions

### Keep the form action row inside the form, moved after media

The media panels are rendered outside the `<form>`, so the final action row
cannot simply be appended below them while remaining a submit button. Use the
HTML form association attribute: keep a single `<form id="project-edit-form">`
and render the final action row outside it with the submit button using
`form="project-edit-form"`. The Back action stays a normal button that calls
`navigate(-1)`. This keeps one action row, in the final position, without
duplicating submit handlers. Alternative: keep the actions inside the form and
move the media panels inside it, but the media panels issue their own requests
and nested submits complicate validation.

### Introduce a reusable drop zone for photos

Add a small `PhotoDropzone` component under
`src/features/projects/components/media/` that owns drag state, the hidden file
input, click-to-open, keyboard activation, and the rejected-file list. It emits
validated files to the gallery, which builds the existing `FormData`
(`photos[i]`) and calls `onUpload` immediately. The zone is rendered only when
`canManage` is true, preserving the current permission model.

### Drop optional thumbnails from the UI

The API treats `thumbs` as optional. The current UI lets users pick a separate
thumb batch and pairs by index, which silently mismatches when counts differ.
Removing the thumbnails button simplifies the flow; stored `thumb_url` values
continue to render when the API supplies them.

### Pass hint copy into MediaSection

Change `MediaSection` to accept a `hint` prop instead of hardcoding
`media.hint`. `ProjectDrawingsPanel` passes a drawings-only key and
`PhotoGalleryManager` passes a photos-only key. Add `media.drawingsHint` and
`media.photosHint` to both locale files and remove reliance on the combined
`media.hint` key (leave or remove the old key; no code reads it after this
change).

### Single action row on lot create and edit

Remove the header action buttons in `pages/lots/edit/index.jsx` and
`pages/lots/create/index.jsx`, and keep the existing footer row (`Cancel` →
rename/prefer `common.back` and Save changes) at the end of the form. The lot
photos panel remains below the edit form.

## Risks / Trade-offs

- **Submit-by-association support** → `form="id"` is supported in all evergreen
  browsers; tests submit the form directly, so the payload assertions stay
  valid.
- **Immediate upload on drop** → users cannot review files before sending.
  Mitigation: validation errors are shown per file and successful uploads show a
  toast; removing the extra confirm matches the request for a simpler flow.
- **Dropping thumbnails** → users lose the manual thumbnail picker, but
  `thumb_url` fallback rendering still works. If thumbnails become required, the
  API should generate them server-side.
- **Lot edit action change** → users accustomed to the header buttons must
  scroll to the footer; this is intentional for consistency with the project
  edit page.
- **Rollback** → revert the action rows, restore `media.hint`, and re-add the
  photo buttons; no API or data migration is involved.
