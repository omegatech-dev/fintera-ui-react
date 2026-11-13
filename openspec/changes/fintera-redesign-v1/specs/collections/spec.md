## Purpose

Lets sellers register collections with a proof while keeping approval and the
balance with admins.

## ADDED Requirements

### Requirement: Seller has a collection queue
The system SHALL give sellers a queue of collections due today and overdue,
with the amount, concept, due date and one action per row.

#### Scenario: Queue shows overdue separately
- **WHEN** a seller opens Cobros
- **THEN** overdue items are shown with a distinct overdue state

### Requirement: Register collection captures the proof
The system SHALL open a `RegisterCollectionSheet` with client and installment
context, expected total, amount received (partial allowed), method, date,
reference and receipt, plus an optional note.

#### Scenario: Partial payment is allowed
- **WHEN** a seller enters an amount lower than the expected total
- **THEN** the collection is recorded as a partial payment

### Requirement: Result is "En revisión"
The system SHALL mark the row as `En revisión` after registration, and SHALL NOT
change the contract balance until an admin approves.

#### Scenario: Seller cannot approve
- **WHEN** a seller registers a collection
- **THEN** the row shows "En revisión" and the balance is unchanged

### Requirement: The actor is audited
The system SHALL write an audit event with the seller who registered the
collection.

#### Scenario: Audit records the seller
- **WHEN** a collection is registered
- **THEN** an audit event names the seller and the installment
