## ADDED Requirements

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
