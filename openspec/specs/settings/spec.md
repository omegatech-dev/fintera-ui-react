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
