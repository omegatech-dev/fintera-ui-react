## Purpose

Stores each project's payment accounts and the instructions the customer sees
when reserving a lot.

## ADDED Requirements

### Requirement: Projects have bank accounts
The system SHALL let a project hold multiple payment accounts (bank, type,
number, currency, holder) and SHALL designate exactly one as default.

#### Scenario: Only one default
- **WHEN** an admin marks an account as default
- **THEN** it becomes the only default for that project

### Requirement: Numbers are masked in lists
The system SHALL mask account numbers in lists and previews, and only show the
full number while editing.

#### Scenario: List shows a masked number
- **WHEN** an account is listed
- **THEN** its number appears as `**** 4821`

### Requirement: Default deletion requires a new default
The system SHALL prevent deleting the default account without first choosing a
new default.

#### Scenario: Cannot delete the only default
- **WHEN** an admin tries to delete the default account
- **THEN** the system requires selecting a new default before deleting

### Requirement: Preview matches customer surfaces
The system SHALL render a preview that matches the customer portal and the
reservation email (account, amount, instructions and action).

#### Scenario: Preview reflects the default account
- **WHEN** an admin opens the preview
- **THEN** the preview shows the default account and the instructions text
