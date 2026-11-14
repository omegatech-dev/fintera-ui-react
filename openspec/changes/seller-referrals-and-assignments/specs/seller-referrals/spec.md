## ADDED Requirements

### Requirement: Seller referral link

Each seller SHALL have a unique public slug and a referral screen with the link,
a QR code and copy/share actions. The screen SHALL show visits, attributed
reservations, conversion and generated commission.

#### Scenario: Seller opens their referral screen

- **WHEN** a seller opens `/vendedor/enlace`
- **THEN** the public URL, QR, copy and share actions are shown
- **AND** the visit, attributed-reservation and commission metrics are visible

#### Scenario: Seller shares the link

- **WHEN** the seller copies or shares the link
- **THEN** the copied value is the seller's public referral URL
- **AND** a confirmation is shown

### Requirement: Referral attribution

A reservation created with an active referral attribution SHALL be assigned to
the link owner with `origin = referral` and without an acceptance step. The
attribution window SHALL be 30 days and the last interaction SHALL win.

#### Scenario: Reservation from a referral link

- **WHEN** a customer opens a seller link and creates a reservation within the
  attribution window
- **THEN** the reservation shows the link owner as the assigned seller
- **AND** the assignment is already accepted
- **AND** the commission origin is `referral`

#### Scenario: Last interaction wins

- **WHEN** a customer visits two different seller links before reserving
- **THEN** the most recent link owner is assigned

#### Scenario: Attribution expired

- **WHEN** the reservation is created after the 30-day window
- **THEN** the expired link does not assign a seller
- **AND** the reservation follows the normal assignment path
