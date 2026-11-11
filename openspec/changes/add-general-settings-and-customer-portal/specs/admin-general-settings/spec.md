## Purpose

Configure the customer portal from the admin app and keep customer accounts in
the dedicated customer portal.

## ADDED Requirements

### Requirement: Support and reservation settings

The general/branding settings page SHALL let an admin set the support WhatsApp,
support email and reservation hold hours.

#### Scenario: Load settings

- **WHEN** an admin opens the general settings page
- **THEN** the current support contact and hold hours are shown

#### Scenario: Save settings

- **WHEN** the admin saves valid values
- **THEN** `PUT /api/v1/settings` is called and a success toast appears

#### Scenario: Invalid values

- **WHEN** the WhatsApp is not 8–20 digits, the email is malformed, or the hold
  is outside 1–720
- **THEN** the form blocks the request and shows an error toast

### Requirement: Customer portal boundary

The admin app SHALL NOT serve `user`-role (customer) accounts; it SHALL show a
notice with a link to the customer portal.

#### Scenario: Customer signs in

- **WHEN** a `user`-role account opens a protected admin route
- **THEN** the customer portal notice is rendered instead of the admin content

#### Scenario: Seller signs in

- **WHEN** a `seller` account opens a protected route
- **THEN** the admin content renders normally
