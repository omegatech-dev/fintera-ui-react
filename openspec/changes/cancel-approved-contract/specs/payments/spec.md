## ADDED Requirements

### Requirement: Cancelled payment status

The payment schedule SHALL render payments whose status is `cancelled` with a
distinct chip and no payment actions, and SHALL exclude them from pending and
overdue counts.

#### Scenario: Cancelled row shows a chip

- **WHEN** the schedule contains a cancelled payment
- **THEN** it renders a "Cancelada" chip
- **AND** no register-payment or upload-receipt action is shown

#### Scenario: Cancelled rows are excluded from counts

- **WHEN** a contract has cancelled and pending payments
- **THEN** only the pending payments count towards the pending and overdue
  totals
