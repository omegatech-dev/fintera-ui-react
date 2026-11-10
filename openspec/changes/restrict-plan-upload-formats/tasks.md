## 1. Validation

- [x] 1.1 Change `DRAWING_ACCEPT` to `.svg,.png,.jpg,.jpeg,.pdf` in `src/features/projects/components/media/mediaFiles.js`.
- [x] 1.2 Change `DRAWING_EXTENSIONS` to `["svg", "png", "jpg", "jpeg", "pdf"]`.
- [x] 1.3 Confirm `drawingTypeLabel` still renders legacy types.

## 2. Copy

- [x] 2.1 Update `media.hint` in `src/locales/es.json`.
- [x] 2.2 Update `media.hint` in `src/locales/en.json`.

## 3. Tests

- [x] 3.1 Update `mediaFiles.test.js` to accept SVG/PNG/JPG/PDF and reject DWG/DXF.
- [x] 3.2 Update `ProjectDrawingsPanel.test.jsx` if it asserts the accepted formats.

## 4. Verification

- [x] 4.1 `npm run lint` passes.
- [x] 4.2 `npm run test:run` passes.
- [x] 4.3 `npm run build` passes.
- [x] 4.4 `openspec validate --changes` passes.
