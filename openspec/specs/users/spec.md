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
