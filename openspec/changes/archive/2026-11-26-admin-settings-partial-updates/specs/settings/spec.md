## ADDED Requirements

### Requirement: Partial section updates

The General settings page SHALL send only the fields of the section being
saved when the API advertises support for partial updates, and SHALL fall back
to sending the full settings snapshot when it does not.

#### Scenario: Partial update with API support

- **WHEN** an admin saves the Notifications section and the API advertises `supports_partial_updates`
- **THEN** the request contains only the notification fields and the other sections keep their stored values

#### Scenario: Legacy API fallback

- **WHEN** an admin saves any section and the API does not advertise `supports_partial_updates`
- **THEN** the request contains the full settings snapshot so no other section loses its stored values

#### Scenario: Capability flag is not a setting

- **WHEN** an admin reads or writes the general settings
- **THEN** the capability flag is never stored as a setting, cached in localStorage or sent back to the API

### Requirement: Deployment currency in reservation labels

The reservation wizard SHALL show the deployment default currency in the
reservation and down payment amount labels, and the bank account form SHALL
fall back to that currency when no currency is selected.

#### Scenario: Currency follows the deployment

- **WHEN** an admin configures a default currency other than HNL
- **THEN** the reservation amount labels show that currency and a new bank account defaults to it
