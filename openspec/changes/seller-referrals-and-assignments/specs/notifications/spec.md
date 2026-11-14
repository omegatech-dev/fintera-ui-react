## MODIFIED Requirements

### Requirement: Bell shows unread count and a dropdown

The system SHALL show a bell with the unread count and a dropdown of typed
notification items (approvals, overdue installments, approved payments,
reservations) with context and time. Assignment notifications SHALL include the
pending countdown and Aceptar/Rechazar actions, and an expired variant.

#### Scenario: Unread badge reflects the list

- **WHEN** there are three unread notifications
- **THEN** the bell badge shows "3"

#### Scenario: Pending assignment notification

- **WHEN** a reservation is assigned to the seller
- **THEN** the bell shows the assignment with its countdown
- **AND** Aceptar and Rechazar are available

#### Scenario: Expired assignment notification

- **WHEN** an assignment expires
- **THEN** the bell shows the expired item with the lost-commission message
- **AND** no accept action remains

### Requirement: Filter and mark-read

The system SHALL offer "Todas" and "No leídas" filters, "Marcar leídas" for a
single item, and a footer link to the full list and preferences.

#### Scenario: Marking all as read clears the badge

- **WHEN** the user clicks "Marcar leídas"
- **THEN** all items become read and the badge clears
