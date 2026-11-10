## Purpose

Let administrators manage the bank accounts a project offers to customers for
reservation payments.

## ADDED Requirements

### Requirement: Dedicated bank-account page

The admin UI SHALL provide a page at `/projects/:id/payment-instructions` that
lists the project's bank accounts and the project name.

#### Scenario: Open the page

- **WHEN** an admin opens a project's payment-instructions page
- **THEN** the page shows the project name and its accounts ordered by position

#### Scenario: Empty project

- **WHEN** the project has no accounts
- **THEN** the page shows an empty state explaining that the portal will block
  payments until an account is added

#### Scenario: Load error

- **WHEN** the accounts cannot be loaded
- **THEN** the page shows the error and a retry action

### Requirement: Manage accounts

The page SHALL let an admin create, edit and delete accounts.

#### Scenario: Create an account

- **WHEN** the admin submits bank, beneficiary, account number and type
- **THEN** the account is created, the list refreshes and a success toast appears

#### Scenario: Required fields

- **WHEN** the admin submits with an empty bank, beneficiary or account number
- **THEN** the form shows validation errors and sends nothing

#### Scenario: Edit an account

- **WHEN** the admin edits an account and saves
- **THEN** the list reflects the new values

#### Scenario: Delete an account

- **WHEN** the admin deletes an account and confirms
- **THEN** the account disappears from the list

### Requirement: Reorder accounts

The page SHALL let an admin move an account up or down and persist the new
position.

#### Scenario: Move an account down

- **WHEN** the admin moves an account down
- **THEN** it swaps position with the next account and the list order updates

#### Scenario: First and last rows

- **WHEN** the account is first or last
- **THEN** the corresponding move control is disabled

### Requirement: Entry points

The UI SHALL link to the page from the project list and the project edit page.

#### Scenario: From the project list

- **WHEN** an admin uses the bank-account action on a project card
- **THEN** the bank-account page opens for that project

#### Scenario: From the project edit page

- **WHEN** an admin opens a project's edit page
- **THEN** a link to its bank accounts is visible

### Requirement: Published project warning

The page SHALL warn when a published project has no accounts.

#### Scenario: Published without accounts

- **WHEN** the project is published and has no accounts
- **THEN** the page explains that customers cannot pay until an account is added
