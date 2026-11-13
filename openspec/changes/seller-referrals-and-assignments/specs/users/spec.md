## MODIFIED Requirements

### Requirement: One form for create and edit

The system SHALL provide one user form in two modes: create (placeholders,
temporary password or email invitation) and edit (prefilled, security panel).
Sections: datos personales, acceso y rol, seguridad, notas internas and
notificaciones. For sellers, the form SHALL also show an admin-only acceptance
score panel with a value, a colour derived from the value and an override
reason.

#### Scenario: Edit is prefilled

- **WHEN** an admin edits a user
- **THEN** personal data, role and status are prefilled

#### Scenario: Create offers an invitation

- **WHEN** an admin creates a user
- **THEN** a temporary password can be generated or an email invitation sent

#### Scenario: Seller score panel

- **WHEN** an admin edits a seller
- **THEN** the acceptance score panel shows the current value and colour
- **AND** the admin can override it with a reason
- **AND** non-admin users cannot edit the score

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
