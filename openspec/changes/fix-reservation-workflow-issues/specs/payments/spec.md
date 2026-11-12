## MODIFIED Requirements

### Requirement: Payment approval and rejection

Authorized users SHALL be able to approve or reject a payment and SHALL see the
updated state after the action. For reservation payments, approval SHALL be
available only when the related contract is approved; otherwise the approve
action SHALL be disabled and the interface SHALL explain that the contract must
be accepted first. When the API rejects an out-of-order approval, the panel
SHALL show the returned message instead of a generic failure.

#### Scenario: Approve a payment

- **WHEN** an authorized user approves a pending payment
- **THEN** the payment is marked approved
- **AND** the payment statistics refresh

#### Scenario: Reject a payment

- **WHEN** an authorized user rejects a payment
- **THEN** the payment status reflects the rejection

#### Scenario: Reservation payment with an unapproved contract

- **WHEN** an authorized user views a submitted reservation payment whose
  contract is pending or submitted
- **THEN** the approve action is disabled
- **AND** the interface states that the reservation cannot be approved without
  approving the contract first

#### Scenario: Reservation payment with an approved contract

- **WHEN** an authorized user views a submitted reservation payment whose
  contract is approved
- **THEN** the approve action is enabled
- **AND** approving it marks the payment approved

#### Scenario: Server rejects an out-of-order approval

- **WHEN** the API responds that the contract must be approved first
- **THEN** the panel shows that message to the user
- **AND** the payment remains in its previous state
