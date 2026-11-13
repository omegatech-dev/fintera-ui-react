# Settings

## Purpose

Let users manage their personal information and security, and review terms and
conditions.

## Requirements

### Requirement: Personal information

The settings page SHALL show and allow updating the selected user's personal
information.

#### Scenario: Open personal info

- **WHEN** an admin or the matching user opens `/settings/user/:userId`
- **THEN** the personal information form is shown with current values

### Requirement: Security settings

The settings page SHALL provide password change controls at
`/settings/user/:userId/security`.

#### Scenario: Open security settings

- **WHEN** the user selects Security
- **THEN** the password change form is shown

### Requirement: Terms and conditions

The settings page SHALL provide a terms and conditions view.

#### Scenario: Open terms

- **WHEN** the user selects Terms and Conditions
- **THEN** the terms content is shown

### Requirement: One settings navigation

The system SHALL expose a single settings navigation with General, Identidad
de marca, Perfil, Seguridad and Términos, replacing the duplicated admin and
personal sidebars.

#### Scenario: Each section has its own screen

- **WHEN** a settings section is opened
- **THEN** it renders in the shared settings shell

### Requirement: Per-section save bar

The system SHALL show a shared save bar with dirty state for each settings
section, not a global one.

#### Scenario: Dirty state is per section

- **WHEN** an admin edits a field in General
- **THEN** the save bar marks that section as having unsaved changes

### Requirement: Settings copy explains consequences

The system SHALL explain the consequence of critical settings (reservation
hold, publish state, notification rules) in plain language.

#### Scenario: Publish toggle explains impact

- **WHEN** an admin toggles a project's visibility
- **THEN** a helper explains that customers lose visibility
