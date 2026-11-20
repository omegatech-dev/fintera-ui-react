# Proposal: Historical Sales Evidence

## Why

Sellers import historical clients in bulk via CSV and then edit each record to attach a photo of the backing document (contract, receipt, or payment proof). Today the file picker only records the file **name** as text — the file itself is never uploaded. On the admin side, the validation queue shows that same name as plain text, so an admin validating a historical client cannot see the evidence they are supposed to validate against. The backend has shipped two endpoints (`POST /historical_sales/:id/evidence`, `GET /historical_sales/:id/evidence`) that store and serve the real file; the UI must use them to close the loop: seller uploads the real file, admin views it to validate or reject.

## What Changes

- **Seller evidence upload**: when a historical client form is saved with a new file attached, the UI uploads the real file to `POST /historical_sales/:id/evidence` (multipart, `file` only) instead of sending the file name as `evidence_file` text in the create/update payload. For manual creation, the record is created first and the evidence is uploaded with the returned `historical_sale.id`. Upload errors from the backend (400/403/404/422) are surfaced to the user; a failed upload does not undo the saved record (partial success, no duplicate records on retry).
- **Evidence preservation on edit**: when editing without attaching a new file, the UI sends the existing `evidence_file` path back in the PUT payload so the evidence is preserved regardless of backend behavior; when a new file is attached, the PUT omits `evidence_file` and the evidence endpoint persists the real path.
- **Admin evidence viewer**: the validation queue's "Evidence" column stops showing the raw path as text and becomes a "View evidence" action that opens a viewer modal rendering `GET /historical_sales/:id/evidence`: inline images, PDFs in an iframe, external `evidence_url` (legacy data) as a link, and a "No evidence" empty state on 404. A download action uses `?download=1`. Validation/rejection actions remain next to the viewer.
- **Seller self-view**: the seller who owns a historical client can view (and download) their own uploaded evidence from the edit page.
- **Support**: new i18n keys (en/es), unit tests for upload and viewer cases, and user documentation updates for the historical clients flow.

Out of scope: deleting evidence via the UI (backend only supports replacing, not removing); an evidence viewer in the seller clients list page; backend changes (the backend team is applying their own fix so an empty `evidence_file` in the PUT no longer wipes stored evidence).

## Capabilities

### New Capabilities
- `historical-sales`: behavior contract for historical client records managed by sellers — attaching a real evidence file when saving a record, preserving previously uploaded evidence across edits, and viewing/downloading evidence for the owning seller and for admins validating the record.

### Modified Capabilities

_None — no existing capability spec covers historical sales._

## Impact

- **Code**:
  - `src/lib/apiClient.js` — add a raw-response mode so callers can inspect status/content-type (needed to distinguish file vs. JSON vs. 404).
  - `src/features/seller/api.js` — new evidence upload and evidence fetch API methods.
  - `src/features/seller/pages/clients/historical/index.jsx` — upload flow on save, evidence preservation, owner evidence viewer.
  - `src/features/commissions/components/HistoricalValidationTab.jsx` — evidence column becomes a viewer action (admin).
- **APIs consumed**: `POST /api/v1/historical_sales/:id/evidence` (multipart `file`, PDF/JPEG/PNG ≤ 10 MB), `GET /api/v1/historical_sales/:id/evidence[?download=1]` (file bytes, or JSON `{ evidence_url }` for legacy data, or 404). Existing `POST`/`PUT /historical_sales` payloads change: `evidence_file` no longer carries a user-supplied file name.
- **Dependencies**: none new; uses the existing `apiClient` and shared UI components.
- **Tests**: `src/features/seller/pages/clients/historical/index.test.jsx`, `src/features/commissions/components/__tests__/HistoricalValidationTab.test.jsx`, plus a new test for the viewer and the apiClient raw-response mode.
- **Docs**: `src/features/docs/content/{en,es}/administration/historical-clients-validation.md`.
- **Risk note**: depends on the backend fix that makes `PUT /historical_sales/:id` preserve `evidence_file` when the payload omits it; until then the UI mitigates by sending the existing path back on edit-without-new-file.
