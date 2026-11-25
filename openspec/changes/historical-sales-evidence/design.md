# Design: Historical Sales Evidence

## Context

Historical clients are bulk-imported by sellers via CSV and later edited one by one to attach an evidence photo (contract, receipt, payment proof). The backend has shipped:

- `POST /api/v1/historical_sales/:id/evidence` — multipart `file` only; PDF/JPEG/PNG ≤ 10 MB; persists the storage path into `evidence_file` and returns `{ historical_sale: { ... }, message }`.
- `GET /api/v1/historical_sales/:id/evidence[?download=1]` — three possible responses: file bytes with correct `Content-Type`, `200` JSON `{ evidence_url }` for legacy data, or `404 { error }` when nothing was uploaded.

Current frontend state:

- `src/features/seller/pages/clients/historical/index.jsx` already validates file type/size locally but only sends `evidence_file: evidence?.name || existingEvidence || null` as text inside the create/update payload; the file itself is never uploaded.
- `src/features/commissions/components/HistoricalValidationTab.jsx` renders `row.evidence_file` as raw text (soon a storage path, not a friendly name) in the table and mobile card.
- `src/lib/apiClient.js` supports `FormData` bodies (drops `Content-Type` so the browser sets the boundary) and a `responseType: "blob"` mode, but blob mode returns a blob for *any* 2xx response (including JSON) and turns error statuses into rejected promises — it cannot distinguish the three evidence GET cases.

Primary flow is **edit of an existing record** (CSV import first, evidence later), so the record id exists before any upload; the manual create path is secondary.

## Goals / Non-Goals

**Goals:**

- Upload the real evidence file when saving a historical client form with a new attachment.
- Preserve previously uploaded evidence when editing without a new attachment.
- Let admins view (and download) the evidence from the validation queue before validating/rejecting.
- Let the owning seller view (and download) their own evidence from the edit page.
- Surface backend upload/view errors with actionable messages.

**Non-Goals:**

- Deleting evidence (backend only supports replacing; no remove endpoint).
- An evidence viewer in the seller clients list page (`src/features/seller/pages/index.jsx`).
- Any backend change; backend is separately fixing `PUT /historical_sales/:id` to not wipe `evidence_file` when the payload omits it.
- No route changes; the viewer is a component within existing pages.

## Decisions

**D1. Evidence upload goes through `apiClient.post` with `FormData`.**
`apiClient` already strips `Content-Type` for `FormData` bodies and attaches the bearer token, so `sellerApi.uploadHistoricalEvidence(id, file)` is a plain `apiClient.post(`${API}/historical_sales/${id}/evidence`, formData)`. Alternative considered (raw `fetch` in the page) rejected: it would bypass token handling and the 401 broadcast.

**D2. Add a `responseType: "response"` mode to `apiClient` instead of bending blob mode.**
The evidence GET must distinguish file vs. `{ evidence_url }` JSON vs. 404 by inspecting status and `Content-Type`. Blob mode collapses those cases; a raw-response mode (`request` returns the `Response` when `responseType === "response"`, after the existing 401 handling) is a small, backward-compatible addition. The evidence helper in `seller/api.js` (`fetchHistoricalEvidence(id, { download })`) then returns a normalized shape:

- `{ kind: "file", url, contentType }` — blob + `URL.createObjectURL`, caller revokes it.
- `{ kind: "external", url }` — JSON body with `evidence_url`.
- `{ kind: "none" }` — 404.
- Throws on other failures (network, 403, 5xx) with the backend message when available.

Alternative considered (return the raw `Response` to the component) rejected: keeps blob/objectURL lifecycle handling in one place, easier to test and reuse for both admin and seller viewers.

**D3. Save flow: PUT first, then evidence upload; no `evidence_file` name in payloads.**
On save with a new file: create/update payload omits `evidence_file`; after success, upload evidence with the record id (from `historical_sale.id` on create, from the route param on edit). A failed upload after a successful save shows the backend error next to the form without navigating away in edit mode and without re-submitting the record in create mode — the create flow stores the returned id in state so a retry uploads evidence against the existing record (no duplicates). On edit **without** a new file, the payload includes `evidence_file: existingEvidence` (the current server path) so evidence survives even before the backend fix lands; after the backend fix this is a harmless no-op. `existingEvidence` state is repurposed from "last file name text" to "current server path from `historical_sale.evidence_file`".

**D4. One shared viewer component, reused by admin queue and seller edit page.**
New component (e.g. `src/features/commissions/components/HistoricalEvidenceViewer.jsx` or shared under `src/features/commissions/` with props) following the proven `PaymentReceipt.jsx` pattern: portal modal, fetch-on-open, `URL.createObjectURL` with `revokeObjectURL` on close, Escape-to-close, loading/error/empty states, and a download action. It handles the three `kind`s from D2 (image inline, PDF in `<iframe>`, external URL as link/image, 404 empty state, unexpected content type → download-only). Alternatives considered: rendering inline in the table (no room for PDFs) and navigating to the edit page (extra step for admins) — both rejected.

**D5. Admin queue: evidence column becomes an action, not text.**
`HistoricalValidationTab` renders "View evidence" (opens the viewer) when `row.evidence_file` is present — `evidence_file` is now the server-side indicator that evidence exists — and "—" otherwise; the raw path text disappears from the table and mobile card. Validate/Reject buttons stay in place so the admin can review the evidence and then decide.

**D6. Download naming is frontend-generated: `respaldo-<id>.<ext>`.**
Backend's `Content-Disposition` uses the storage name (random id + extension), not the seller's original file name, and there is no column for the original name. The extension comes from `row.evidence_file` when available, else from the response `Content-Type` map (`image/png` → `.png`, `image/jpeg` → `.jpg`, `application/pdf` → `.pdf`). No backend change requested.

**D7. Upload errors are shown inline next to the form (not only a toast).**
The existing error `Banner` in the historical form page already handles `err?.message`; evidence upload failures reuse it so the 400/403/422 backend messages remain visible while the user retries. 403 renders a generic permission message rather than the raw backend text.

## Risks / Trade-offs

- [Backend PUT fix not deployed when this ships] → Mitigated: edit-without-new-file sends `evidence_file: existingEvidence`, which preserves evidence under both the old and new backend behavior; cleanup task to drop the fallback after backend confirms the fix.
- [`evidence_file` doubles as "has evidence" flag] → It is the only indicator the list endpoint exposes; acceptable for now. If the backend later adds an explicit boolean, the viewer trigger switches to it.
- [Blob object URL leaks if the component unmounts mid-fetch] → Viewer follows the `PaymentReceipt` pattern: request-id guard plus `revokeObjectURL` in the unmount cleanup.
- [Legacy records with exotic content types] → Rendered as download-only per spec; QA report goes to backend with record id and status.
- [Large PDFs in an `<iframe>` may be slow on mobile] → Acceptable; the viewer shows a loading state and download remains available.
- [Removing `evidence_file` from create/update payloads changes the API contract] → Verified against backend swagger; `evidence_file` in the JSON payload is no longer the way files are attached. Rollback is straightforward (revert the payload change) since the evidence endpoints are additive.

## Migration Plan

Single frontend deployment; no data migration. The change is additive — if evidence endpoints misbehave, reverting restores the previous text-only behavior (which loses nothing the backend already stored). Coordination note: backend deploys their `Update` fix (preserve `evidence_file` when payload omits it) independently; the frontend fallback in D3 covers both orders.

## Open Questions

- None blocking. Follow-up candidate (needs backend): an explicit "remove evidence" endpoint if the UI ever needs it.
