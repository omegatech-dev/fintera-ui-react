## Context

The API companion change (`add-client-identity-documents` in FinteraAPI) adds
the identity document endpoints, the `422` that names a missing document on
contract creation, and the acceptance of HEIC and HEIF files. This change is
the staff side of that contract.

The two screens where the staff lives today are:

- the contract detail page, `src/features/contracts/pages/detail/index.jsx`,
  whose "documentos" tab renders
  `src/features/contracts/components/ContractDetails/tabs/DocumentsTab.jsx`.
  That component only offers generated PDFs and has no upload affordance at
  all;
- the customer drawer, `src/features/users/components/RightSidebar.jsx`, opened
  from the users table (`src/features/users/pages/index.jsx`) and from the
  customer edit page (`src/features/users/pages/edit/index.jsx`). It already
  has a "Documents" section for the balance PDF, and it already gates an
  admin-only block on `currentUser?.role === "admin"`.

The reservation wizard is `src/features/projects/pages/reserve/ReserveWizard.jsx`.
Its third step collects the customer documents in an anonymous `<input
type="file" multiple>` with no `accept` list, no size check and no camera
button, and the page builds the multipart body in
`src/features/projects/pages/reserve/index.jsx`, appending `documents[0]`,
`documents[1]`, ... The customer portal sends the same anonymous fields, which
is why the API cannot tell a DNI from an RTN.

The create-client form is `src/features/users/components/UserForm.jsx`, used by
`src/features/users/pages/create/index.jsx`. It already does the "create, then
upload the picture" dance, and the upload failure is swallowed so the user
still exists.

The house pattern for file validation is
`src/features/projects/components/media/mediaFiles.js`: a module of constants
plus a `validateXFile(file)` that returns `{ ok, reason }`.

See `proposal.md` and the delta specs under `specs/`.

## Goals / Non-Goals

**Goals:**

- Let the staff see, download, upload and replace the DNI and the RTN of a
  customer from the two screens where they already work.
- Make the camera work on a phone, including the HEIC file an iPhone
  produces.
- Make the reservation wizard ask for two named documents instead of an
  anonymous list, and stop the staff from sending a reservation that the API
  will reject.
- Keep the validation in one place so the client and the API agree on what is
  acceptable.

**Non-Goals:**

- Reading the content of a document. The app never inspects what a DNI looks
  like.
- Versioning. A new file replaces the previous one.
- Changing the generated PDF downloads of the documents tab.
- Changing the seller scope of the contract tab, which the API enforces.

## Decisions

### The slot component is shared, the screens decide where to put it

`src/shared/forms/IdentityDocumentSlots.jsx` renders the two slots and owns
the view, download, upload and replace actions. It takes the applicant's
documents, a callback for a successful upload and a flag that tells it
whether the caller may upload.

The contract tab and the customer drawer both mount it. Putting it under
`src/shared/forms/` keeps the existing folder structure: `src/shared/` already
holds `forms/`, `modals/` and `utils/`, and the slot is a form control used
by two features.

### The validation module follows `mediaFiles.js`

`src/shared/utils/identityDocuments.js` exports the accept list, the maximum
size and the validation, mirroring
`src/features/projects/components/media/mediaFiles.js`:

- `IDENTITY_DOCUMENT_ACCEPT` — `image/*,application/pdf` for the input, plus
  the explicit list `["application/pdf","image/jpeg","image/jpg","image/png",
  "image/webp","image/heic","image/heif"]` for the validation;
- `IDENTITY_DOCUMENT_MAX_BYTES` — `10 * 1024 * 1024`, the same limit the API
  enforces with `storage.MaxFileSize()`;
- `validateIdentityDocumentFile(file)` returning `{ ok, reason }`;
- `normalizeIdentityDocumentImage(file)` returning a Promise of the file to
  upload.

The accepted MIME list is the API's list, so the client rejects exactly what
the server would reject.

### HEIC is normalized with the platform, not with a dependency

`normalizeIdentityDocumentImage` tries `createImageBitmap(file)` when the file
is a HEIC or a HEIF. When the bitmap decodes, the image is drawn on a canvas
and exported as a JPEG with `canvas.toBlob("image/jpeg", 0.9)`. When it does
not decode, the original file is returned unchanged.

Safari decodes HEIC natively, so on iOS the photo is converted to a JPEG and
the staff sees a file the API accepts without any special case. On Chrome,
which cannot decode HEIC at all, the conversion fails and the original HEIC is
sent; the API accepts HEIC precisely so that this case is not a dead end.

This adds no dependency. `browser-image-compression` and `heic2any` would
either pull a WASM decoder into the bundle or duplicate what the platform
already does.

### The camera is a second input, not a capture attribute on the existing one

The slot renders two hidden file inputs: one with `capture="environment"` for
"Tomar foto" and one without it for "Elegir archivo". A single input cannot
offer both reliably: `capture` makes iOS open the camera directly and skip
the library, which removes the choice.

The capture input uses `accept="image/*"` so the camera is offered, and the
validation and the normalization run on the captured file exactly as they run
on a chosen one.

### The preview is fetched with the token and shown from a blob

The content and preview endpoints require the bearer token, so the browser
cannot put them in an `<img src>` or a link. Both are fetched through
`apiClient` with `responseType: "blob"`, the way `contractsApi.downloadPdf`
already does.

"Ver" opens a modal that turns the blob into an object URL and renders it as
an image when the MIME type starts with `image/` and as an embedded document
otherwise. "Descargar" saves the blob under its own name with the
`downloadBlob` helper that `DocumentsTab` already uses, extracted to
`src/shared/utils/download.js` so the slot and the tab share one
implementation.

### The contract tab loads its own documents

The documents tab already receives the whole contract. The identity documents
are a separate resource with their own authorization rules, so the section
loads them with its own request and shows its own loading and error states,
rather than widening the contract payload with a field that the seller scope
has to police.

### The wizard sends typed fields and blocks an incomplete submit

`ReserveWizard` replaces the anonymous `<input multiple>` with the two slots.
The wizard state holds the DNI file and the RTN file separately, and the
submit handler refuses to submit while one of them is empty, marking the
empty slot as required.

`src/features/projects/pages/reserve/index.jsx` then appends `identity_document`
and `rtn_document` to the multipart body instead of `documents[0]` and
`documents[1]`. The free-form `documents[N]` fields stay in the API for the
other clients.

### The "reuse" affordance reads the person, within the caller's scope

Telling the user that the customer already has the documents requires reading
the person's identity documents. The API answers that read for an admin and
for a seller that has a contract with that customer in scope, so the wizard
offers "reutilizar si ya tiene" to both roles and never forces an upload that
the API would only discard.

The profile keeps its own rule: the drawer section is gated on
`currentUser?.role === "admin"`, so a seller does not see the documents in the
profile even though the API can answer for a customer it serves.

### A contract creation never replaces a document that is on file

When the API answers `201` with a kind in its `already_present` array, the
wizard treats the response as a success, shows the stored document and
explains that the file the user picked was not stored, and why. A non-empty
`already_present` array is a notice, not a failure. The staff replaces a
document deliberately, from the slot, where the current file is visible before
it changes.

### The create-client form uploads after the customer exists

`UserForm` collects the DNI and the RTN in create mode and hands them to
`src/features/users/pages/create/index.jsx` together with the picture file.
The page creates the customer first, then uploads the two documents, and a
failed document upload is reported without undoing the customer, exactly like
the picture upload today.

## Risks / Trade-offs

- **[The create form gains two required-looking fields.]** → They are
  required for the contract, not for the customer record, so the form does not
  block the creation; it reports the upload failure and the customer can be
  completed later from the profile.
- **[The API rejects the reservation and the wizard has to catch it.]** → The
  `422` body names the missing kinds, so the wizard marks the right slot
  instead of showing a generic error.
- **[A HEIC that the browser cannot decode is sent as is.]** → The API accepts
  HEIC and HEIF, so it is stored and can be downloaded; only the inline
  preview is unavailable for it.
- **[The preview modal shows a blob from the API.]** → The object URL is
  revoked when the modal closes, and the modal is rendered through a portal so
  the surrounding card animations cannot clip it.
- **[The contract tab makes one more request.]** → It is scoped to the
  documents tab, so the other tabs are unaffected, and the request is small.
- **[The dictionaries drift between ES and EN.]** → Both files are updated in
  the same change and the existing key-set check covers them.
- **[The wizard sends a document the API will not store.]** → The API reports
  the kind as already present and the wizard shows the stored document with the
  explanation, instead of failing the reservation.

## Migration Plan

Ship the FinteraAPI change first, with the contract-creation requirement
disabled, then this change, then enable the requirement. The new UI degrades
gracefully while the API is not deployed: the endpoints answer `404` and the
section shows its error state.

No data migration and no persisted state change. Rolling back the app leaves
the documents the API already stored untouched.
