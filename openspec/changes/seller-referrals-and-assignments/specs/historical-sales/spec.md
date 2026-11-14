## ADDED Requirements

### Requirement: Manual historical client

A seller SHALL be able to register a historical client and sale with client
data, free-text project, lot, area, price, sale date, payment mode, sale status
and commission (rate, amount, paid/pending), with optional evidence. The record
SHALL create no reservation, block no lot, not change availability and not
affect the score.

#### Scenario: Seller saves a historical client

- **WHEN** the seller fills and saves the historical form
- **THEN** the client appears in "Mis clientes" with the HISTÓRICO chip
- **AND** no reservation or lot block is created
- **AND** the commission is stored with the real sale date and origin
  `historical`
- **AND** the seller's score does not change

#### Scenario: Pending validation

- **WHEN** a historical record has not been validated by an admin
- **THEN** it is shown as "Histórico · por validar"

### Requirement: CSV import of historical clients

The system SHALL import historical clients from a CSV with a downloadable
template, toggles to mark records historical, skip duplicates by identity and
create the commission with the sale date, a column mapping and a summary of
valid and skipped rows.

#### Scenario: Import a valid CSV

- **WHEN** the seller uploads a CSV with the expected columns
- **THEN** the mapping and the number of valid records are previewed
- **AND** the import creates the records with their commissions

#### Scenario: Skip duplicates

- **WHEN** "Omitir duplicados por identidad" is active and a row matches an
  existing identity
- **THEN** the row is skipped and reported

#### Scenario: Row errors

- **WHEN** some rows are invalid
- **THEN** valid rows are imported
- **AND** the invalid rows are listed with their reason

### Requirement: Admin validates historical records

An admin SHALL be able to validate or reject a historical record. Validated
records SHALL leave the pending state without creating a reservation.

#### Scenario: Admin validates

- **WHEN** an admin validates a historical record
- **THEN** its validation status becomes `validated`
- **AND** the record stays a historical sale
