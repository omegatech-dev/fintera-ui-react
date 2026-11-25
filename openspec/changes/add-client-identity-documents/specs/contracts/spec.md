## MODIFIED Requirements

### Requirement: Contract details

The contract details view SHALL be available at a dedicated route and SHALL
present overview, applicant, financial, lot and project, and document
information, plus payment schedule, ledger, and notes tabs.

The documents tab SHALL present the personal identity documents of the
applicant — the DNI and the RTN — alongside the generated documents, so that
the staff sees what the customer actually sent.

#### Scenario: Open contract details

- **WHEN** the user opens a contract's route
- **THEN** the detail page renders with its tabs

#### Scenario: The documents tab shows the identity documents

- **WHEN** the user opens the documents tab of a contract
- **THEN** a "Documentos de identificación personal" section is shown
- **AND** it contains one slot for the DNI and one slot for the RTN

## ADDED Requirements

### Requirement: The contract tab shows the identity document slots

The contract documents tab SHALL show one slot per identity document kind of
the applicant. A slot with no document on file SHALL show an empty state and
offer the upload actions; a slot with a document SHALL show its original file
name, its size and the date it was uploaded.

#### Scenario: A customer without documents

- **WHEN** the applicant has no DNI and no RTN on file
- **THEN** both slots show the empty state
- **AND** each slot offers the upload and capture actions

#### Scenario: A customer with documents

- **WHEN** the applicant has a DNI on file
- **THEN** the DNI slot shows the original file name, the size and the upload
  date
- **AND** the slot offers the view, download and replace actions

### Requirement: Viewing and downloading an identity document

The staff SHALL be able to view an identity document inline and to download the
original file. Both actions SHALL go through the authenticated API, and a
failure SHALL be reported without closing the screen.

#### Scenario: View a document

- **WHEN** the user selects "Ver" on a slot that holds a document
- **THEN** a preview shows the document
- **AND** the preview renders an image as an image and a PDF as a document

#### Scenario: Download a document

- **WHEN** the user selects "Descargar" on a slot that holds a document
- **THEN** the original file is saved with its own name

#### Scenario: The document cannot be loaded

- **WHEN** the request for the preview or the download fails
- **THEN** an error message names the failure
- **AND** the screen stays usable

### Requirement: Uploading and replacing an identity document

The staff SHALL be able to upload a DNI or an RTN for the applicant of a
contract. Uploading a document of a kind that already exists SHALL replace it,
and the replaced file SHALL no longer be offered. A rejected upload SHALL name
the file and the reason.

#### Scenario: Upload a document

- **WHEN** the user uploads a valid file on an empty slot
- **THEN** the document is stored for the applicant
- **AND** the slot shows the uploaded file
- **AND** every contract of that customer shows the same document

#### Scenario: Replace a document

- **WHEN** the user uploads a new file on a slot that already holds a document
- **THEN** the previous document is replaced
- **AND** the slot shows the new file

#### Scenario: The file is rejected

- **WHEN** the user uploads a file with an unsupported type or above the size
  limit
- **THEN** an error message names the file and the reason
- **AND** the slot keeps the document it had

### Requirement: Capturing an identity document with the camera

The staff SHALL be able to capture an identity document with the camera of the
device, and the captured file SHALL be normalized to JPEG when the device
produces a HEIC or HEIF image. The capture and the file picker SHALL apply the
same validation.

#### Scenario: Capture with the camera

- **WHEN** the user selects "Tomar foto" on an empty slot
- **THEN** the device camera opens
- **AND** the captured photo is attached to the slot

#### Scenario: A HEIC capture is normalized

- **WHEN** the captured photo is a HEIC or HEIF image
- **THEN** it is converted to a JPEG before it is uploaded
- **AND** the slot shows the converted file

#### Scenario: The capture is too large

- **WHEN** the captured or chosen file is above the size limit
- **THEN** it is rejected before any request is sent
- **AND** an error message states the maximum size

### Requirement: Legacy attachments are read-only

The contract documents tab SHALL show the files that were attached to a
contract before the identity documents existed, as read-only entries with no
kind, and SHALL NOT offer any action that turns them into the DNI or the RTN of
the customer.

#### Scenario: A contract with a legacy attachment

- **WHEN** the contract has a migrated legacy attachment
- **THEN** the entry is listed in the identity documents section
- **AND** it is marked as read-only and without a kind
- **AND** no action is offered to promote it to a slot

### Requirement: The reservation wizard requires the identity documents

The reservation wizard SHALL ask for the DNI and the RTN of the customer as
two typed slots instead of an anonymous list of attachments, SHALL let the user
reuse the documents the customer already has when the caller may read them, and
SHALL not submit the reservation while one of the two is missing.

#### Scenario: Both documents are attached

- **WHEN** the user attaches a DNI and an RTN in the wizard
- **THEN** the reservation can be submitted
- **AND** the two documents are sent as the DNI and the RTN, not as an
  anonymous list

#### Scenario: A document is missing

- **WHEN** one of the two slots is empty
- **THEN** the submit action is blocked
- **AND** the empty slot is marked as required

#### Scenario: Reuse the documents the customer already has

- **WHEN** the selected customer already has a DNI and an RTN on file and the
  caller may read them
- **THEN** the wizard offers to reuse them
- **AND** reusing them satisfies the requirement without a new upload

#### Scenario: The uploaded document is not stored because one is on file

- **WHEN** the API responds `201` with a kind in its `already_present` array
- **THEN** the wizard treats the response as a success
- **AND** it shows the document that is stored
- **AND** it explains that the file the user picked was not stored

#### Scenario: The API reports a missing document

- **WHEN** the API rejects the reservation and names a missing document kind
- **THEN** the wizard marks that slot as required
- **AND** the customer is not asked to start over
