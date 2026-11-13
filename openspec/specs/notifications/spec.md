# Notifications

## Purpose

Surfaces actionable events in a bell dropdown with unread tracking, on desktop
and mobile.

## Requirements

### Requirement: Bell shows unread count and a dropdown

The system SHALL show a bell with the unread count and a dropdown of typed
notification items (approvals, overdue installments, approved payments,
reservations) with context and time.

#### Scenario: Unread badge reflects the list

- **WHEN** there are three unread notifications
- **THEN** the bell badge shows "3"

### Requirement: Filter and mark-read

The system SHALL offer "Todas" and "No leídas" filters, "Marcar leídas" for a
single item, and a footer link to the full list and preferences.

#### Scenario: Marking all as read clears the badge

- **WHEN** the user clicks "Marcar leídas"
- **THEN** all items become read and the badge clears

### Requirement: Notifications work on mobile

The system SHALL expose the same bell and dropdown on mobile.

#### Scenario: Mobile bell opens the list

- **WHEN** a user taps the bell on a 390px viewport
- **THEN** the notifications panel opens

### Requirement: API failures are explicit

The system SHALL show an error state if the notifications request fails, and
SHALL NOT render an empty list as if there were nothing to show.

#### Scenario: Failed request shows an error

- **WHEN** the notifications request returns an error
- **THEN** an error message with retry is displayed, not an empty list
