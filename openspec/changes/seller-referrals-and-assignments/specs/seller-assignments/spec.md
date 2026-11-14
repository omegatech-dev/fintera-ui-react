## ADDED Requirements

### Requirement: Seller question in the reservation

The reservation SHALL show the question "¿Un vendedor te atendió?" with the
seller list, a search option and a "No me atendió nadie" option. The question
SHALL NOT block advancing: when it is empty or "No me atendió nadie", the
reservation SHALL be assigned automatically.

#### Scenario: Client picks a seller

- **WHEN** the person creating the reservation picks a seller
- **THEN** the assignment origin is `manual`
- **AND** the chosen seller is recorded

#### Scenario: Nobody attended the client

- **WHEN** the question is left empty or "No me atendió nadie" is selected
- **THEN** the reservation advances normally
- **AND** the assignment origin is `automatic`

#### Scenario: Search another seller

- **WHEN** the user chooses "Buscar otro vendedor"
- **THEN** the list can be filtered to find a seller outside the suggested ones

### Requirement: Assignment acceptance window

Manual and automatic assignments SHALL start `pending` and notify the seller in
the bell with a 2-hour countdown. Accepting SHALL move the assignment to
`accepted` and commit the commission to that seller. Rejecting or not answering
SHALL move it to `expired`, lower the score and trigger reassignment.

#### Scenario: Seller accepts in time

- **WHEN** the seller accepts before the deadline
- **THEN** the assignment becomes `accepted`
- **AND** the reservation enters the seller's client portfolio
- **AND** the commission is committed to that seller

#### Scenario: Seller rejects

- **WHEN** the seller activates Rechazar
- **THEN** the assignment expires immediately
- **AND** the reservation is offered to another eligible seller

#### Scenario: Deadline passes

- **WHEN** the deadline passes without an answer
- **THEN** the assignment becomes `expired`
- **AND** the seller loses that commission
- **AND** the assignment is offered to another eligible seller

#### Scenario: Reservation never blocks

- **WHEN** one or more assignments expire
- **THEN** the reservation continues its normal flow
- **AND** its status is not cancelled or invalidated

### Requirement: Automatic assignment fairness

Automatic assignment SHALL prefer green sellers over yellow and SHALL never
assign to a red seller. Within the same level it SHALL prefer the lowest pending
load and rotate fairly so the same seller is not always chosen.

#### Scenario: Green seller is preferred

- **WHEN** an automatic assignment has green and yellow candidates
- **THEN** a green candidate is chosen

#### Scenario: Red seller is excluded

- **WHEN** the only candidates are red
- **THEN** none of them receives an automatic assignment
- **AND** the reservation continues without a seller

#### Scenario: Rotation across equal candidates

- **WHEN** several sellers share the same level and load
- **THEN** the choice rotates between them across assignments
