# Decision record — `add-client-identity-documents` (FinteraUI)

Companion to the backend record of the same name. It explains what was decided
after this change was first written and reviewed, and what this app has to
build as a result. Review date: 2026-11-23.

## What did not change

The component plan, the shared `identityDocuments.js` validation module, the
two hidden inputs for "Tomar foto" (`capture="environment"`) and "Elegir
archivo", the HEIC normalization through `createImageBitmap` and a canvas, the
blob-based preview modal, and the typed `identity_document` / `rtn_document`
multipart fields are all confirmed as written.

## The two rules the API now enforces

### Rule A — A contract creation never replaces a document that is on file

When the creation response carries a kind in its `already_present` array, the
stored document is kept and the uploaded file is not written. The response is
a `201`: a non-empty `already_present` array is a notice, not a failure, and
the wizard treats it as a success. The wizard shows
the document that is stored and explains that the file the user picked was not
stored. Replacing a document is deliberate, from the slot, where the current
file is visible before it changes.

This matters because the wizard and the API used to disagree: the wizard
blocked the submit on an empty slot while the API counted a document already on
file. Without Rule A, a seller forced to upload would have overwritten the
DNI the customer sent from the portal, for every contract that person has.

**Where:** `specs/contracts/spec.md` (new scenario), `design.md` (new
decision and a new risk), `tasks.md` 6.6.

### Rule B — The "reuse" affordance reads the person, within the caller's scope

`GET /users/:user_id/identity_documents` answers `200` for an admin and for a
seller that has a contract with that customer in scope, `403` otherwise. The
wizard therefore offers "reutilizar si ya tiene" to both roles and never
forces an upload the API would only discard. When the read answers `403`, the
wizard asks for the upload without claiming the customer is missing a document.

The profile keeps its own rule: the drawer section stays gated on
`currentUser?.role === "admin"`, so a seller does not see the documents there.

**Where:** `specs/contracts/spec.md`, `specs/users/spec.md`, `design.md`,
`tasks.md` 6.3.

## The corrections

- **The drawer does not open from the contract detail.** It opens from the
  users table (`src/features/users/pages/index.jsx`) and from the customer edit
  page (`src/features/users/pages/edit/index.jsx`). Fixed in `design.md`.
- **Three test files do not exist.** `documents/api` aside, there is no test
  under `src/features/contracts/components/ContractDetails/tabs/`, no
  `RightSidebar.test.jsx` and no `src/features/users/api.test.js`. Task 9.4
  and 9.6 now say *add*, not *extend*. `src/features/contracts/api.test.js`
  and `src/features/projects/pages/reserve/ReserveWizard.test.jsx` do exist.

## Checklist for the implementer

- [ ] The profile section is gated on the admin role; the contract tab is not.
- [ ] The wizard reuses the customer's documents instead of asking for them
      again, whenever the person-scoped read answers.
- [ ] The wizard handles the "already present" kinds of the creation response
      without failing the reservation and without pretending the file was
      stored.
- [ ] The client and the API accept exactly the same formats and the same
      10 MB limit.
