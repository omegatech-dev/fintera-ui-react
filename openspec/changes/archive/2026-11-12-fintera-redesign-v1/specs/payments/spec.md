## ADDED Requirements

### Requirement: Payment detail includes a breakdown and receipt
The system SHALL show a payment detail with the installment context, amount,
accumulated interest, total to credit and the receipt (name, size, upload date).

#### Scenario: Total is computed from parts
- **WHEN** a payment is opened
- **THEN** the total is the sum of the amount and accumulated interest

### Requirement: Status tabs show counts
The system SHALL provide payment status tabs (Todos, Por aprobar, Vencidos,
Aprobados) with counts that match the filtered rows.

#### Scenario: Tab count matches rows
- **WHEN** a status tab is selected
- **THEN** its count equals the number of rows shown

## MODIFIED Requirements

### Requirement: Payment approval and rejection

Authorized users SHALL be able to approve or reject a payment and SHALL see the
updated state after the action. Approval SHALL require a confirmation naming the
amount and client, and rejection SHALL require a reason and SHALL NOT be placed
next to approval.

#### Scenario: Approve a payment

- **WHEN** an authorized user approves a pending payment
- **THEN** a confirmation names the amount and the client
- **AND** after confirming, the payment is marked approved
- **AND** the payment statistics refresh

#### Scenario: Reject a payment

- **WHEN** an authorized user rejects a payment
- **THEN** a reason is required
- **AND** the payment status reflects the rejection
