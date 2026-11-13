## Purpose

Gives admins a single place to see, pay and configure seller commissions, and
gives sellers a read-only view of their own commissions.

## ADDED Requirements

### Requirement: Admin can review commissions
The system SHALL provide an admin-only `/commissions` area with KPIs (month,
pending, paid year-to-date, average rate) and a filterable table of commissions
by seller, status and period.

#### Scenario: Admin filters pending commissions
- **WHEN** an admin selects the "Pendientes" filter
- **THEN** only commissions with status pending are shown, with their counts

#### Scenario: Average rate is shown
- **WHEN** an admin opens the commissions area
- **THEN** the average commission rate is displayed as a KPI

### Requirement: Admin can pay a commission
The system SHALL allow an admin to mark a commission as paid from its row action,
recording the payment date and an audit event, without altering the contract's
balance.

#### Scenario: Admin pays a pending commission
- **WHEN** an admin clicks "Pagar" on a pending commission
- **THEN** its status becomes paid and an audit event is written
- **AND** the contract balance is unchanged

### Requirement: Commission is frozen at approval
The system SHALL compute and store the commission rate when a contract is
approved. Subsequent rule changes SHALL NOT modify already-approved contracts.

#### Scenario: Rule change does not rewrite history
- **WHEN** an admin changes the default rate after a contract was approved
- **THEN** the previously approved contract keeps its original commission rate

### Requirement: Admin can configure commission rules
The system SHALL provide a rules sheet with a default rate, a payment trigger
and per-seller exceptions, applying changes only to new contracts.

#### Scenario: Admin sets an exception
- **WHEN** an admin sets a different rate for one seller and saves
- **THEN** new contracts for that seller use the exception rate
- **AND** the change is audited with the previous and new rate

### Requirement: Seller commissions are read-only
The system SHALL show a seller their own commissions with month total, pending
amount and payment history, without any payout or rule-editing action.

#### Scenario: Seller cannot pay a commission
- **WHEN** a seller views their commissions
- **THEN** no "Pagar" action and no rule-editing action is available
