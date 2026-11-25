## 1. Shared utilities

- [ ] 1.1 Add `src/shared/utils/identityDocuments.js` with
      `IDENTITY_DOCUMENT_ACCEPT`, `IDENTITY_DOCUMENT_MAX_BYTES` (10 MB),
      `IDENTITY_DOCUMENT_MIME_TYPES` and `validateIdentityDocumentFile(file)`
      returning `{ ok, reason }`, following the style of
      `src/features/projects/components/media/mediaFiles.js`.
- [ ] 1.2 Add `normalizeIdentityDocumentImage(file)` to the same module: it
      decodes a HEIC or HEIF file with `createImageBitmap`, draws it on a
      canvas and returns a JPEG, and returns the original file unchanged when
      the format is not HEIC or the browser cannot decode it.
- [ ] 1.3 Extract the `downloadBlob` helper of
      `src/features/contracts/components/ContractDetails/tabs/DocumentsTab.jsx`
      into `src/shared/utils/download.js` and use it from both places.

## 2. Shared components

- [ ] 2.1 Add `src/shared/forms/IdentityDocumentSlots.jsx` rendering the DNI
      and the RTN slots: the empty state, the file name, the size and the
      upload date, and the "Ver", "Descargar", "Tomar foto" and "Elegir
      archivo" actions.
- [ ] 2.2 Give the slot two hidden file inputs, one with
      `capture="environment"` for "Tomar foto" and one without it for "Elegir
      archivo", and run the validation and the HEIC normalization on both.
- [ ] 2.3 Add `src/shared/modals/IdentityDocumentPreviewModal.jsx`, rendered
      through a portal, that shows a blob as an image when its MIME type
      starts with `image/` and as an embedded document otherwise, and revokes
      the object URL when it closes.
- [ ] 2.4 Make the slot accept the documents, an upload callback and a flag
      that tells it whether the caller may upload.

## 3. Contract documents tab

- [ ] 3.1 Add the "Documentos de identificación personal" section to
      `src/features/contracts/components/ContractDetails/tabs/DocumentsTab.jsx`
      below the generated documents.
- [ ] 3.2 Load the documents of the contract in the section, with its own
      loading and error states, and mount
      `src/shared/forms/IdentityDocumentSlots.jsx`.
- [ ] 3.3 Render the legacy entries of the contract as read-only rows with no
      kind and no upload action.

## 4. Customer profile

- [ ] 4.1 Add the identity document slots to the "Documents" section of
      `src/features/users/components/RightSidebar.jsx`, below the balance PDF
      download.
- [ ] 4.2 Gate the section on `currentUser?.role === "admin"`, the same way
      the credit score block is gated, so a seller sees nothing.
- [ ] 4.3 Show the uploaded documents on the slot after a successful upload
      without closing the drawer.

## 5. Create-client form

- [ ] 5.1 Add the DNI and the RTN slots to the create mode of
      `src/features/users/components/UserForm.jsx`, next to the profile
      picture block, and pass the two files to `onSubmit` alongside the
      picture file.
- [ ] 5.2 In `src/features/users/pages/create/index.jsx`, upload the two
      documents after the customer is created, and report a failed upload
      without undoing the customer.

## 6. Reservation wizard

- [ ] 6.1 Replace the anonymous `<input type="file" multiple>` of
      `src/features/projects/pages/reserve/ReserveWizard.jsx` with the two
      typed slots, and keep the drop zone for each one.
- [ ] 6.2 Hold the DNI file and the RTN file in separate state, mark the
      empty slot as required, and block the submit while one of them is
      missing.
- [ ] 6.3 Offer "reutilizar si ya tiene" when the selected customer already
      has both documents, reading them from the person-scoped endpoint, and
      treat the reuse as satisfying the requirement. The endpoint answers for an
      admin and for a seller that serves the customer; when it answers `403`,
      the wizard asks for the upload without claiming the customer is missing
      one.
- [ ] 6.4 In `src/features/projects/pages/reserve/index.jsx`, append
      `identity_document` and `rtn_document` to the multipart body instead of
      `documents[0]` and `documents[1]`.
- [ ] 6.5 Handle the `422` of the API: read the missing kinds from the
      response and mark the matching slots as required.
- [ ] 6.6 Handle the kinds in the `already_present` array of the `201` creation
      response: treat the response as a success, show the stored document in
      the slot and explain that the file the user picked was not stored.

## 7. API modules

- [ ] 7.1 Add `getIdentityDocuments(id)` and
      `uploadIdentityDocument(id, formData)` to
      `src/features/users/api.js`.
- [ ] 7.2 Add `getIdentityDocuments(guid)`,
      `uploadIdentityDocument(guid, formData)` and the blob readers for the
      preview and the content to `src/features/contracts/api.js`.

## 8. Copy

- [ ] 8.1 Add the ES keys for the section, the slots, the actions, the
      errors and the reuse option to `src/locales/es.json`.
- [ ] 8.2 Add the matching EN keys to `src/locales/en.json`, and confirm both
      files keep the same key set.

## 9. Tests

- [ ] 9.1 Add `src/shared/utils/identityDocuments.test.js` covering the
      accepted types, the 10 MB limit, the HEIC conversion and the fallback
      when the browser cannot decode the file.
- [ ] 9.2 Add `src/shared/forms/IdentityDocumentSlots.test.jsx` covering the
      empty state, the view, the download, the upload and the rejection of an
      invalid file.
- [ ] 9.3 Add `src/shared/modals/IdentityDocumentPreviewModal.test.jsx`
      covering the image and the document rendering and the object URL
      cleanup.
- [ ] 9.4 Add
      `src/features/contracts/components/ContractDetails/tabs/DocumentsTab.test.jsx`
      covering the identity documents section, and add
      `src/features/users/components/RightSidebar.test.jsx` covering the
      admin-only slots.
- [ ] 9.5 Extend `src/features/projects/pages/reserve/ReserveWizard.test.jsx`
      with the two slots, the blocked submit and the reuse option.
- [ ] 9.6 Extend `src/features/contracts/api.test.js` with the new endpoints
      and add `src/features/users/api.test.js` with the person-scoped ones.

## 10. Documentation and verification

- [ ] 10.1 Update `documentation/` if the staff guide describes the documents
      tab.
- [ ] 10.2 `npm run lint`
- [ ] 10.3 `npm run test:run`
- [ ] 10.4 `npm run build`
- [ ] 10.5 `openspec validate add-client-identity-documents`
