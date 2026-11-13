# Users

## Purpose

Manage application users, their roles, profile data, and account status, and
support password recovery.

## Requirements

### Requirement: User list with search and pagination

The users page SHALL list users with search, filtering, sorting, and pagination.

#### Scenario: Search users

- **WHEN** the user enters a search term
- **THEN** the list shows matching users for the current page

### Requirement: User management

Admins SHALL be able to create and update users, toggle account status, and
resend confirmation emails.

#### Scenario: Toggle user status

- **WHEN** an admin toggles a user's status
- **THEN** the user's active state changes
- **AND** the list reflects the change

### Requirement: Profile and password recovery

Users SHALL be able to view their profile, upload a profile picture, change
their password, and recover access using a recovery code.

#### Scenario: Change password

- **WHEN** the user submits the current and new password
- **THEN** the password is updated

#### Scenario: Recover account

- **WHEN** the user requests a recovery code and verifies it
- **THEN** they can set a new password with the verified code

### Requirement: One form for create and edit

The system SHALL provide one user form in two modes: create (placeholders,
temporary password or email invitation) and edit (prefilled, security panel).
Sections: datos personales, acceso y rol, seguridad, notas internas and
notificaciones.

#### Scenario: Edit is prefilled

- **WHEN** an admin edits a user
- **THEN** personal data, role and status are prefilled

#### Scenario: Create offers an invitation

- **WHEN** an admin creates a user
- **THEN** a temporary password can be generated or an email invitation sent

### Requirement: Permissions are shown by role

The system SHALL display the role's permission summary on the user form, so the
admin sees what the role can and cannot do.

#### Scenario: Role permissions are visible

- **WHEN** an admin selects a role
- **THEN** the form shows that role's allowed and denied actions

### Requirement: Deactivation uses a named confirmation

The system SHALL deactivate a user through a confirmation that names the user,
and restrict deletion to admins.

#### Scenario: Deactivation names the user

- **WHEN** an admin deactivates a user
- **THEN** a confirmation names the user before it happens
