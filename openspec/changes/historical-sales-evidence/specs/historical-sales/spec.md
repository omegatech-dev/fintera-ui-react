# Historical Sales Evidence — Delta Spec

Capability: `historical-sales` (new). Covers how sellers attach a real evidence file to historical client records and how the owning seller and admins view or download that evidence.

## ADDED Requirements

### Requirement: Uploading a real evidence file on save

When a user saves the historical client form with a newly attached evidence file, the system SHALL upload the actual file to the evidence endpoint (`POST /historical_sales/:id/evidence`, multipart with a single `file` field) instead of persisting only the file name as text.

#### Scenario: Editing an existing record with a new file

- **WHEN** the seller edits an existing historical client and saves the form with a newly attached PDF/JPEG/PNG file within the size limit
- **THEN** the record update is sent first without a user-supplied `evidence_file` name, and the file is uploaded to the evidence endpoint for that record
- **THEN** the evidence upload result is confirmed to the user and the stored `evidence_file` reflects the server path

#### Scenario: Creating a record manually with a new file

- **WHEN** the seller creates a historical client from the blank form with an evidence file attached
- **THEN** the record is created first, and the file is uploaded using the `id` returned by the create response (`historical_sale.id`)
- **THEN** if the record creation succeeds, a failed evidence upload does not create a second record on retry; the upload is retried against the already-created record id

#### Scenario: Editing without attaching a new file

- **WHEN** the seller edits a historical client that already has uploaded evidence and saves without attaching a new file
- **THEN** the previously uploaded evidence is preserved (the current evidence path is sent back with the update so it is not wiped)

#### Scenario: Client-side file validation

- **WHEN** the attached file is not PDF/JPEG/PNG or exceeds 10 MB
- **THEN** the file is rejected locally with a clear message and no upload request is made

### Requirement: Surfacing evidence upload errors

The system SHALL show the backend-provided error message when an evidence upload fails, and SHALL NOT undo or duplicate the historical client record.

#### Scenario: Upload rejected by the backend

- **WHEN** the evidence endpoint responds 400 (no file / too large), 403 (not owner), 404 (record missing), or 422 (unsupported type)
- **THEN** the user sees the backend error message (a generic permission message for 403), the saved record remains intact, and the attached file remains selected so the user can retry

### Requirement: Viewing evidence (admin validation)

In the admin validation queue for historical clients, the system SHALL offer a "view evidence" action for records that have evidence, opening a viewer that renders the evidence fetched from `GET /historical_sales/:id/evidence`, and SHALL show an empty "no evidence" state for records without evidence instead of displaying a raw file path.

#### Scenario: Evidence stored as a file

- **WHEN** the viewer is opened and the endpoint responds with file bytes (`image/png`, `image/jpeg`, or `application/pdf`)
- **THEN** the evidence is rendered inline: images in an image element, PDFs in an embedded frame, loaded with authentication via a blob object URL that is revoked when the viewer closes

#### Scenario: Legacy evidence stored as an external URL

- **WHEN** the endpoint responds `200` with JSON containing `evidence_url`
- **THEN** the viewer shows the external evidence via that URL (image inline or a link) instead of a blob

#### Scenario: Record without evidence

- **WHEN** the endpoint responds `404` ("no evidence uploaded")
- **THEN** the viewer shows a "no evidence" empty state

#### Scenario: Unexpected content type

- **WHEN** the endpoint responds with a content type other than the supported image/PDF types
- **THEN** the viewer offers the evidence as a download instead of rendering it inline

#### Scenario: Viewer load failure

- **WHEN** the evidence request fails (network error or non-404 error status)
- **THEN** the viewer shows an error state with a retry action

### Requirement: Downloading evidence

The system SHALL allow the user viewing a historical client's evidence to download the file via `GET /historical_sales/:id/evidence?download=1`, saved locally with the name `respaldo-<record id>.<extension>` derived from the evidence path or content type.

#### Scenario: Download from the viewer

- **WHEN** the user activates the download action in the evidence viewer
- **THEN** the file is fetched with the download flag and saved locally with the generated name

### Requirement: Evidence visibility by role

Admins SHALL be able to view and download the evidence of any historical client, and the owning seller SHALL be able to view and download the evidence of their own records; other sellers SHALL NOT be offered evidence actions on records they do not own.

#### Scenario: Admin opens evidence from the validation queue

- **WHEN** an admin activates the evidence action on any row of the validation queue
- **THEN** the viewer loads that record's evidence

#### Scenario: Owner opens evidence from the edit page

- **WHEN** the seller who owns a historical client opens its edit page and activates the evidence view action
- **THEN** the viewer loads the record's evidence

#### Scenario: Backend rejects a non-owner seller

- **WHEN** an evidence request is rejected with 403
- **THEN** the viewer shows the error state rather than rendering content
