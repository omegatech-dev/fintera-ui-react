## MODIFIED Requirements

### Requirement: Admin can review commissions

The system SHALL provide an admin-only `/commissions` area with KPIs
(commissions for the period, paid, pending, average rate) and a table filterable
by period and seller, backed by `GET /api/v1/reports/commissions`. The table
SHALL show the seller's acceptance score badge and SHALL include historical
commissions in the period KPIs using their real sale date.

#### Scenario: Admin filters by seller

- **WHEN** an admin selects a seller in the commissions area
- **THEN** only that seller's commissions are shown in the table and KPIs

#### Scenario: Historical commissions count

- **WHEN** a seller has historical commissions with a sale date inside the
  selected period
- **THEN** those amounts are included in the period KPIs
- **AND** they remain identifiable by origin

#### Scenario: Average rate is shown

- **WHEN** an admin opens the commissions area
- **THEN** the average commission rate is displayed as a KPI

### Requirement: Project rates

The system SHALL expose the per-project commission rates
(`commission_rate_direct`, `commission_rate_bank`, `commission_rate_cash`) and a
global default rate plus per-seller exceptions. The effective rate SHALL be: the
seller exception, otherwise the project rate for the financing type, otherwise
the global default. A contract without a seller SHALL use the "unassigned" rate.

#### Scenario: Seller exception wins

- **WHEN** a seller has an exception and a contract is approved
- **THEN** the exception rate is applied
- **AND** the stored commission amount uses it

#### Scenario: Unassigned contract

- **WHEN** a contract is approved without a seller
- **THEN** the "unassigned" rate is applied

#### Scenario: Editing a rate

- **WHEN** an admin edits a project's commission rates and saves
- **THEN** new contracts for that project use the new rates

### Requirement: Seller commissions are read-only

The system SHALL show a seller their own commissions with period total, pending
amount and paid amount, and an `ORIGEN` column (Enlace / Directo / Histórico),
without any payout action.

#### Scenario: Seller sees the origin

- **WHEN** a seller views `/vendedor/comisiones`
- **THEN** each row shows its origin
- **AND** no "Marcar pagada" action is available

#### Scenario: Seller cannot pay a commission

- **WHEN** a seller opens their commissions
- **THEN** the payout action is not rendered
