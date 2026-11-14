## ADDED Requirements

### Requirement: Commission credit

The commissions views SHALL show a pending commission credit for a seller, and
an admin SHALL be able to apply it to mark it settled.

#### Scenario: Credit is shown

- **WHEN** a seller has a pending commission credit
- **THEN** the admin and seller commissions views show the credit read-only

#### Scenario: Admin applies the credit

- **WHEN** an admin applies a pending commission credit
- **THEN** the credit becomes settled
- **AND** the view refreshes to reflect the change
