# Contracts

## Purpose

Manage the contract lifecycle for a lot, including reservation, approval,
rejection, cancellation, reopening, and contract details.

## Requirements

### Requirement: Contract list and statistics

The contracts page SHALL display contracts with search, status and date
filters, pagination, and summary counts by status. Counts SHALL reconcile
(total equals the sum of status counts), and the contract number SHALL be the
primary identifier with the lot as context.

#### Scenario: Filter by status

- **WHEN** the user selects a contract status
- **THEN** the list shows only contracts with that status

#### Scenario: Counts reconcile

- **WHEN** the contracts page loads
- **THEN** the total count equals the sum of the status counts

### Requirement: Contract lifecycle actions

Authorized users SHALL be able to approve, reject, cancel, and reopen a
contract, and the interface SHALL reflect the new state after success.

#### Scenario: Approve a contract

- **WHEN** an authorized user approves a pending contract
- **THEN** the contract status becomes approved
- **AND** the list and statistics refresh

#### Scenario: Reject a contract

- **WHEN** an authorized user rejects a contract with a reason
- **THEN** the contract status becomes rejected
- **AND** the reason is stored with the contract

### Requirement: Contract details

The contract details view SHALL be available at a dedicated route and SHALL
present overview, applicant, financial, lot and project, and document
information, plus payment schedule, ledger, and notes tabs.

#### Scenario: Open contract details

- **WHEN** the user opens a contract's route
- **THEN** the detail page renders with its tabs

### Requirement: Ledger separates posted and scheduled entries

The system SHALL show the running balance only for posted ledger entries.
Scheduled installments SHALL display `—` in the balance column and SHALL NOT
change the real balance.

#### Scenario: Scheduled row does not alter balance

- **WHEN** the ledger lists a future installment
- **THEN** its balance column shows `—`

### Requirement: Balance is never negative

The system SHALL show `Saldo` as a positive amount, and label an overpayment as
"Saldo a favor".

#### Scenario: Overpayment is labeled

- **WHEN** payments exceed the contract total
- **THEN** the balance is labeled "Saldo a favor" instead of a negative number

### Requirement: Status copy comes from one map

The system SHALL derive the status banner from a single status map
(approved/active, closed, cancelled), not from multiple literals.

#### Scenario: Approved shows one message

- **WHEN** a contract is approved
- **THEN** the banner says it is approved and active
