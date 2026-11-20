# Tasks: Historical Sales Evidence

## 1. API layer

- [x] 1.1 Add `responseType: "response"` mode to `request()` in `src/lib/apiClient.js` that returns the raw `Response` after the existing 401 handling, without parsing the body
- [x] 1.2 Add `uploadHistoricalEvidence(id, file)` to `src/features/seller/api.js` — `POST /api/v1/historical_sales/:id/evidence` via `apiClient.post` with a `FormData` containing only `file`
- [x] 1.3 Add `fetchHistoricalEvidence(id, { download } = {})` to `src/features/seller/api.js` — GET the evidence endpoint and normalize to `{ kind: "file", url, contentType }` (blob + object URL), `{ kind: "external", url }` (JSON `evidence_url`), or `{ kind: "none" }` (404); throw with the backend message on other failures
- [x] 1.4 Add unit tests for the raw-response mode in `src/lib/apiClient.test.js` (if not present, create it) covering file, JSON, and 404-style statuses
- [x] 1.5 Add unit tests for `fetchHistoricalEvidence` covering the three kinds, an unexpected failure, and the `?download=1` flag

## 2. Seller — upload flow in the historical client form

- [x] 2.1 In `src/features/seller/pages/clients/historical/index.jsx`, repurpose `existingEvidence` to hold the current server path from `historical_sale.evidence_file`
- [x] 2.2 Update the save flow: create/update payload no longer includes a user-supplied `evidence_file` name; on edit without a new file include `evidence_file: existingEvidence` to preserve uploaded evidence (fallback until the backend `Update` fix is confirmed)
- [x] 2.3 After a successful create with a new file attached, store the returned `historical_sale.id` and upload the evidence with it; if the upload fails, keep the stored id so a retry uploads against the existing record without creating a duplicate
- [x] 2.4 After a successful update with a new file attached, upload the evidence for the route-param id; on failure, show the backend error message in the existing error `Banner` (generic permission message for 403), stay on the page, and keep the file selected for retry
- [x] 2.5 Show success feedback only for the part that succeeded (record saved vs. evidence uploaded) using existing toast/banner patterns and new i18n keys
- [x] 2.6 Extend `src/features/seller/pages/clients/historical/index.test.jsx`: upload called with FormData on edit and on create, PUT without a new file preserves `evidence_file`, upload failure shows the backend error and does not navigate/duplicate

## 3. Shared evidence viewer component

- [x] 3.1 Create `src/features/commissions/components/HistoricalEvidenceViewer.jsx` following the `PaymentReceipt.jsx` pattern (portal modal, fetch on open, request-id guard, `URL.createObjectURL`/`revokeObjectURL`, Escape to close, body scroll lock)
- [x] 3.2 Render by kind: image inline, PDF in `<iframe>`, `external` as image/link, `none` as "no evidence" empty state; unexpected content type shows download-only; error state with retry
- [x] 3.3 Add the download action: fetch `?download=1` as a blob and save as `respaldo-<id>.<ext>` (extension from `evidence_file` path or the Content-Type map)
- [x] 3.4 Add i18n keys for the viewer (title, view/download actions, "no evidence", error, retry) in `src/locales/en.json` and `src/locales/es.json`
- [x] 3.5 Add tests for the viewer covering file image, file PDF, external URL, 404 empty state, load error with retry, download naming, and object URL revocation on close

## 4. Admin — validation queue integration

- [x] 4.1 In `src/features/commissions/components/HistoricalValidationTab.jsx`, replace the raw `evidence_file` text in the evidence column and mobile card with a "View evidence" action when `row.evidence_file` is present and "—" otherwise, wired to the viewer
- [x] 4.2 Update `src/features/commissions/components/__tests__/HistoricalValidationTab.test.jsx`: no raw path text rendered, viewer opens for rows with evidence, empty state for rows without

## 5. Seller — self-view of own evidence

- [x] 5.1 Add a "View evidence" action to the historical client edit page (`src/features/seller/pages/clients/historical/index.jsx`) shown when the record has evidence, using the shared viewer
- [x] 5.2 Add a test that the owner can open the viewer from the edit page and that a 403 shows the error state

## 6. Documentation and verification

- [x] 6.1 Update `src/features/docs/content/en/administration/historical-clients-validation.md` and the Spanish equivalent: evidence column now opens a viewer, sellers upload the real file when editing after CSV import
- [x] 6.2 Run `npm run lint`, `npm run test:run`, and `npm run build` (or `npm run verify`) and fix any failures
- [x] 6.3 Coordinate with backend: confirm their `Update` fix (preserve `evidence_file` when the PUT omits it) is deployed, then optionally remove the edit-without-new-file `evidence_file` fallback from 2.2 in a follow-up
