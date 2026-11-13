## ADDED Requirements

### Requirement: Acceptance score display

The system SHALL show a seller's acceptance score (0–100%) computed from
`accepted / (accepted + expired)` over the last 90 days. Levels SHALL be green
≥ 85, yellow 60–84 and red < 60. A seller with no history SHALL start green at
100 and be labelled "Nuevo". The score SHALL never be shown to a customer.

#### Scenario: Score levels

- **WHEN** a seller's score is 85 or higher
- **THEN** it is shown as green
- **WHEN** it is between 60 and 84
- **THEN** it is shown as yellow
- **WHEN** it is below 60
- **THEN** it is shown as red

#### Scenario: New seller

- **WHEN** a seller has no assignment history
- **THEN** the score shows 100% and the "Nuevo" label
- **AND** the level is green

#### Scenario: Customer never sees the score

- **WHEN** a customer uses the portal or a reservation screen
- **THEN** no score, origin or commission information is rendered

### Requirement: Admin can override the score

An admin SHALL be able to override a seller's score value with a reason. The
colour SHALL be derived from the new value and the override SHALL be audited
with actor, reason and date.

#### Scenario: Admin edits the score

- **WHEN** an admin changes the score on the user form and saves a reason
- **THEN** the new value is stored
- **AND** the colour follows the value
- **AND** an audit entry records the actor, reason and date

#### Scenario: Read-only detail

- **WHEN** a user opens the seller detail
- **THEN** the score ratio over 90 days is shown
- **AND** an admin override shows its author and date
