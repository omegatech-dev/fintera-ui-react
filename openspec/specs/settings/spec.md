# Settings

## Purpose

Let users manage their personal information and security, and review terms and
conditions.
## Requirements
### Requirement: Personal information

The settings page SHALL show and allow updating the selected user's personal
information.

#### Scenario: Open personal info

- **WHEN** an admin or the matching user opens `/settings/user/:userId`
- **THEN** the personal information form is shown with current values

### Requirement: Security settings

The settings page SHALL provide password change controls at
`/settings/user/:userId/security`.

#### Scenario: Open security settings

- **WHEN** the user selects Security
- **THEN** the password change form is shown

### Requirement: Terms and conditions

The settings page SHALL provide a terms and conditions view.

#### Scenario: Open terms

- **WHEN** the user selects Terms and Conditions
- **THEN** the terms content is shown

### Requirement: One settings navigation

The system SHALL expose a single settings navigation with General, Identidad
de marca, Perfil, Seguridad and Términos, replacing the duplicated admin and
personal sidebars.

#### Scenario: Each section has its own screen

- **WHEN** a settings section is opened
- **THEN** it renders in the shared settings shell

### Requirement: Per-section save bar

The system SHALL show a shared save bar with dirty state for each settings
section, not a global one.

#### Scenario: Dirty state is per section

- **WHEN** an admin edits a field in General
- **THEN** the save bar marks that section as having unsaved changes

### Requirement: Settings copy explains consequences

The system SHALL explain the consequence of critical settings (reservation
hold, publish state, notification rules) in plain language.

#### Scenario: Publish toggle explains impact

- **WHEN** an admin toggles a project's visibility
- **THEN** a helper explains that customers lose visibility

### Requirement: General settings sections

The admin General settings page SHALL present its configuration as consistent,
open sections rather than nested cards. It SHALL include Application name,
Support and reservations, Legal and contact, Notifications, and Regional
sections, each with a heading, description, validation and its own save/discard
controls.

#### Scenario: Open General settings

- **WHEN** an admin opens `/settings/general`
- **THEN** the page shows the five sections in a consistent layout with no nested card around any section

#### Scenario: Section save is independent

- **WHEN** an admin changes and saves one section
- **THEN** only that section's values are changed, and the other sections keep their stored values

#### Scenario: Validation feedback

- **WHEN** an admin submits invalid values in a section
- **THEN** saving is blocked, the error is shown inline in that section, and the other sections remain unchanged

#### Scenario: Discard changes

- **WHEN** an admin discards changes in a section
- **THEN** that section's fields return to the last saved values

### Requirement: Support and reservations settings

The General page SHALL let an admin configure the support WhatsApp number,
support email, reservation hold duration, minimum reservation amount, reservation
payment due days, down payment due days, and down payment due days when a
reservation exists.

#### Scenario: Load support and reservation values

- **WHEN** an admin opens the General page
- **THEN** the current support contact, hold duration, minimum reservation amount and due windows are shown

#### Scenario: Save support and reservation values

- **WHEN** an admin saves valid support and reservation values
- **THEN** the settings are persisted and a success message confirms the update

#### Scenario: Invalid reservation values

- **WHEN** the minimum reservation amount is negative, a due window is outside 1–365 days, or the down-payment window is shorter than the reservation window
- **THEN** saving is blocked with inline feedback

#### Scenario: Minimum reservation applies

- **WHEN** an admin creates a reservation below the configured minimum amount
- **THEN** the reservation form blocks the request and explains the minimum

### Requirement: Legal and contact settings

The General page SHALL let an admin configure the legal name, tax ID, legal
address, website and terms effective date. The Terms and Conditions views SHALL
render the configured support email, support WhatsApp number and legal details
instead of hardcoded contact information.

#### Scenario: Terms use configured details

- **WHEN** an admin updates the legal or support contact details and a user opens Terms
- **THEN** the Terms view shows the configured email, phone/WhatsApp, legal name, address and effective date

#### Scenario: Missing legal values

- **WHEN** optional legal values are empty
- **THEN** the Terms view omits them or shows the existing safe fallback instead of a broken value

### Requirement: Notification settings

The General page SHALL let an admin enable or disable customer email
notifications, enable or disable overdue reminders, and configure how many days
before a payment due date the upcoming reminder is sent.

#### Scenario: Save notification settings

- **WHEN** an admin saves valid notification settings
- **THEN** the settings are persisted and reflected by customer-facing reminder behavior

#### Scenario: Reminder lead time

- **WHEN** the upcoming reminder is set to a number of days
- **THEN** upcoming-payment reminders are based on that lead time rather than a fixed value

#### Scenario: Deployment kill switch

- **WHEN** the deployment disables email globally
- **THEN** customer emails remain disabled even if the admin setting is enabled

### Requirement: Regional defaults

The General page SHALL let an admin configure the default currency, default
locale and timezone. These defaults SHALL be used for new records and for
display formatting when a record does not specify its own value.

#### Scenario: Save regional defaults

- **WHEN** an admin saves a valid currency, locale and timezone
- **THEN** the settings are persisted and used as the deployment defaults

#### Scenario: Record-specific values win

- **WHEN** a contract already has its own currency or a user has a saved locale
- **THEN** the record or user value is used instead of the regional default

#### Scenario: Invalid regional values

- **WHEN** the currency is not a supported three-letter code, the locale is unsupported, or the timezone is invalid
- **THEN** saving is blocked with inline feedback

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

