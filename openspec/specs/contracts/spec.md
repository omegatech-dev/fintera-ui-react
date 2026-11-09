# Contracts

## Purpose

Manage the contract lifecycle for a lot, including reservation, approval,
rejection, cancellation, reopening, and contract details.

## Requirements

### Requirement: Contract list and statistics

The contracts page SHALL display contracts with search, status and date
filters, pagination, and summary counts by status.

#### Scenario: Filter by status

- **WHEN** the user selects a contract status
- **THEN** the list shows only contracts with that status

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

The contract details view SHALL present overview, applicant, financial, lot and
project, and document information, plus payment schedule, ledger, and notes
tabs.

#### Scenario: Open contract details

- **WHEN** the user selects a contract
- **THEN** the details modal opens on the overview tab
- **AND** the other tabs are available
