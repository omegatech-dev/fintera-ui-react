## MODIFIED Requirements

### Requirement: User management

Admins SHALL be able to create and update users, toggle account status, and resend confirmation emails.

From the customer profile, an admin SHALL be able to see the identity
documents of the customer, view and download them, and upload or replace them.
A seller SHALL NOT see the identity documents of a customer in the profile;
the same documents are reachable by a seller in the contract documents tab of
the contracts it serves.

#### Scenario: Toggle user status

- **WHEN** an admin toggles a user's status
- **THEN** the user's active state changes
- **AND** the list reflects the change

#### Scenario: An admin opens a customer profile

- **WHEN** an admin opens the profile of a customer
- **THEN** the identity document slots for the DNI and the RTN are shown

#### Scenario: A seller opens a customer profile

- **WHEN** a seller opens the profile of a customer
- **THEN** the identity document slots are not shown

### Requirement: One form for create and edit

The system SHALL provide one user form in two modes: create (placeholders,
temporary password or email invitation) and edit (prefilled, security panel).
Sections: datos personales, acceso y rol, seguridad, notas internas and
notificaciones.

The create mode SHALL also collect the identity documents of the customer, the
DNI and the RTN. The documents SHALL be uploaded once the customer exists,
the same way the profile picture is, and a failed upload SHALL NOT undo the
creation of the customer.

#### Scenario: Edit is prefilled

- **WHEN** an admin edits a user
- **THEN** personal data, role and status are prefilled

#### Scenario: Create offers an invitation

- **WHEN** an admin creates a user
- **THEN** a temporary password can be generated or an email invitation sent

#### Scenario: Create collects the identity documents

- **WHEN** an admin fills the create form
- **THEN** the form asks for the DNI and the RTN
- **AND** each one offers the upload and capture actions

#### Scenario: The documents are uploaded after the customer is created

- **WHEN** the customer is created with a DNI and an RTN
- **THEN** both documents are uploaded for the new customer

#### Scenario: The upload fails after the customer was created

- **WHEN** the customer is created but the document upload fails
- **THEN** the customer still exists
- **AND** an error message says that the documents could not be uploaded

## ADDED Requirements

### Requirement: The customer profile shows the identity document slots

The customer profile SHALL show one slot per identity document kind. A slot
with no document on file SHALL show an empty state and offer the upload and
capture actions; a slot with a document SHALL show its original file name, its
size and the date it was uploaded, and SHALL offer the view, download and
replace actions.

#### Scenario: A customer without documents

- **WHEN** an admin opens the profile of a customer who has no documents
- **THEN** both slots show the empty state

#### Scenario: A customer with documents

- **WHEN** an admin opens the profile of a customer who has a DNI on file
- **THEN** the DNI slot shows the file name, the size and the upload date
- **AND** the slot offers the view, download and replace actions

#### Scenario: Uploading from the profile

- **WHEN** an admin uploads a valid file on an empty slot of the profile
- **THEN** the document is stored for that customer
- **AND** the slot shows the uploaded file
- **AND** the contracts of that customer show the same document

#### Scenario: A rejected upload keeps the slot as it was

- **WHEN** an admin uploads a file with an unsupported type or above the size
  limit
- **THEN** an error message names the file and the reason
- **AND** the slot keeps the document it had
