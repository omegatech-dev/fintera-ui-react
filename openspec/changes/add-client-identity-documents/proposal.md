## Why

The staff cannot show a customer the DNI or RTN they sent with a reservation,
because the API never exposed the files it had already received. The contract
detail page has a "Documentos" tab that only offers generated PDFs — the
customer record, the promise of sale, the rescission and the account statement
— and nothing that came from the customer. The client profile drawer has the
same blind spot.

The capture flow is broken on its own: the only file input that accepts a
customer document has no `accept` list, no size check and no camera button, so
a customer who photographs their DNI with an iPhone produces a HEIC file that
the API drops silently. The staff then asks for the document again, with no
way to tell whether the customer sent it.

## What Changes

- Add a reusable pair of identity document slots (DNI and RTN) with **Ver**,
  **Descargar**, **Subir** and **Tomar foto**, shown in two places:
  - a new "Documentos de identificación personal" section in the contract
    "Documentos" tab, and
  - the client profile drawer ("ver información"), for admins only.
- Add browser-side normalization of HEIC and HEIF captures to JPEG, plus a
  10 MB validation, so a photo taken with an iPhone arrives as a file the API
  accepts.
- Add the two slots to the create-client form. The documents are uploaded right
  after the client is created, exactly like the profile picture today.
- Rework the reservation wizard so the two slots are typed instead of an
  anonymous list of attachments, with a "reutilizar si ya tiene" option when
  the customer already has them, and with the submit blocked while one of them
  is missing.
- Add the identity document endpoints to `usersApi` and `contractsApi`, and a
  preview modal that renders the stored file behind the authenticated API.
- Add the ES and EN copy for every new string, and cover the new behavior with
  tests.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `contracts`: the contract "Documentos" tab gains the personal identity
  documents of the applicant, and the reservation wizard requires them.
- `users`: the client profile drawer gains the identity document slots for
  admins, and the create-client form asks for them.

## Impact

- `src/shared/forms/IdentityDocumentSlots.jsx` (new)
- `src/shared/utils/identityDocuments.js` (new)
- `src/shared/modals/IdentityDocumentPreviewModal.jsx` (new)
- `src/features/contracts/components/ContractDetails/tabs/DocumentsTab.jsx`
- `src/features/contracts/api.js`
- `src/features/users/components/RightSidebar.jsx`
- `src/features/users/components/UserForm.jsx`
- `src/features/users/pages/create/index.jsx`
- `src/features/users/api.js`
- `src/features/projects/pages/reserve/ReserveWizard.jsx`
- `src/features/projects/pages/reserve/index.jsx`
- `src/locales/es.json`, `src/locales/en.json`
- `documentation/` if the staff guide mentions the documents tab
- Depends on FinteraAPI `add-client-identity-documents` for the endpoints and
  for the contract-creation requirement
