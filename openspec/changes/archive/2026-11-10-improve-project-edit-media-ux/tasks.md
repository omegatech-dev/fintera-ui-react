## 1. Locale and media rules

- [x] 1.1 Add `media.drawingsHint` and `media.photosHint` to `src/locales/en.json` with drawing-only and photo-only copy, and verify the JSON parses.
- [x] 1.2 Add the same keys to `src/locales/es.json` with the requested Spanish copy ("Los planos aceptan DWG, DXF, PDF y SVG (máx. 50 MB cada uno)." / "Las fotos aceptan JPEG, PNG y WebP (máx. 10 MB cada una).") and verify the JSON parses.
- [x] 1.3 Update `MediaSection` to accept a `hint` prop and stop rendering `media.hint` directly; verify existing media tests still render.

## 2. Scoped panel guidance

- [x] 2.1 Pass `t("media.drawingsHint")` from `ProjectDrawingsPanel` and verify the drawings test sees only drawing formats.
- [x] 2.2 Pass `t("media.photosHint")` from `PhotoGalleryManager` and verify the photo tests see only photo formats.
- [x] 2.3 Remove the photo-format mention from the drawings panel and the drawing-format mention from the photo gallery in both locales, verified by a full-text search of the new keys.

## 3. Drag-and-drop photo upload

- [x] 3.1 Create `src/features/projects/components/media/PhotoDropzone.jsx` with click-to-open, drag-over/drag-leave/drop handling, keyboard activation, and the rejected-file list; verify with a component test.
- [x] 3.2 Replace the hidden photo/thumbnail inputs and three buttons in `PhotoGalleryManager` with `PhotoDropzone` and upload valid files immediately via the existing `onUpload` callback; verify the gallery refreshes and no separate send step remains.
- [x] 3.3 Keep the drop zone hidden for users without `canManage` while leaving the existing photo grid visible; verify with a permission test.
- [x] 3.4 Remove the now-unused `media.thumbnails` and `media.send` usages from the gallery code and confirm no remaining references with a search.

## 4. Project edit action placement

- [x] 4.1 Give the edit form an id, move the Back/Save action row after the payment-instructions link, drawings panel, and photos panel, and associate the submit button with `form="<id>"`; verify the page renders one Back and one Save action at the end.
- [x] 4.2 Ensure saving from the final row still sends the same `project` payload and navigates to `/projects`; extend `src/features/projects/pages/__tests__/Projects.test.jsx` to cover it.

## 5. Lot create/edit consistency

- [x] 5.1 Remove the duplicate header Back/Save actions in `src/features/projects/pages/lots/edit/index.jsx` and `src/features/projects/pages/lots/create/index.jsx`, and keep a single final action row with Back and Save/Create; verify exactly one of each remains.

## 6. Tests and verification

- [x] 6.1 Update `PhotoGalleryManager.test.jsx` and `ProjectDrawingsPanel.test.jsx` for the new hints and drop zone, and add tests for rejected file types and sizes.
- [x] 6.2 Run `npm run lint` and fix any new findings.
- [x] 6.3 Run `npm run test:run` and fix failures.
- [x] 6.4 Run `npm run build` and confirm the production bundle succeeds.
- [x] 6.5 Run `openspec validate --change improve-project-edit-media-ux` and confirm the change is valid.
- [x] 6.6 Document the media workflow in `documentation/features/project-media.md` and link it from `documentation/README.md`.
