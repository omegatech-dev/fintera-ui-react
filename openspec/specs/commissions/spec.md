# Commissions

## Purpose

Gives admins a single place to see and pay seller commissions, and gives sellers
a read-only view of their own commissions. Rates live on each project.

## Requirements

### Requirement: Admin can review commissions

The system SHALL provide an admin-only `/commissions` area with KPIs (commissions
for the period, paid, pending, average rate) and a table filterable by period and
seller, backed by `GET /api/v1/reports/commissions`.

#### Scenario: Admin filters by seller

- **WHEN** an admin selects a seller in the commissions area
- **THEN** only that seller's commissions are shown in the table and KPIs

#### Scenario: Average rate is shown

- **WHEN** an admin opens the commissions area
- **THEN** the average commission rate is displayed as a KPI

### Requirement: Admin can pay a commission

The system SHALL allow an admin to mark a commission as paid from its row action
through `PATCH /api/v1/contracts/:guid/commission/pay`, recording the payment
date and actor, writing an audit event, and leaving the contract balance
unchanged. Paying twice SHALL be rejected.

#### Scenario: Admin pays a pending commission

- **WHEN** an admin clicks "Marcar pagada" on a pending commission
- **THEN** its row shows "Pagada" with the payout date
- **AND** an audit event names the admin and the amount
- **AND** the contract balance is unchanged

#### Scenario: Already paid

- **WHEN** an admin tries to pay a commission that is already paid
- **THEN** the API rejects the request and the UI does not change the row

### Requirement: Commission amount is stable

The system SHALL use the `commission_amount` stored on the contract. If an older
contract has no stored amount, the payout operation SHALL compute it from the
project rates and persist it at that moment.

#### Scenario: Rate change does not rewrite history

- **WHEN** an admin changes a project commission rate after a contract exists
- **THEN** already stored contract commissions keep their original amount

### Requirement: Project rates

The system SHALL expose the existing per-project commission rates
(`commission_rate_direct`, `commission_rate_bank`, `commission_rate_cash`) in the
project create/edit forms. A per-seller exception table is **not** part of v1.

#### Scenario: Editing a rate

- **WHEN** an admin edits a project's commission rates and saves
- **THEN** new contracts for that project use the new rates

### Requirement: Seller commissions are read-only

The system SHALL show a seller their own commissions with period total, pending
amount and paid amount, without any payout action.

#### Scenario: Seller cannot pay a commission

- **WHEN** a seller views `/vendedor/comisiones`
- **THEN** no "Marcar pagada" action is available
