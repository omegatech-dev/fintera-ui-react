## Purpose

Let administrators manage the discovery fields shown in the customer portal's
project directory and keep the admin project list consistent with them.

## ADDED Requirements

### Requirement: Manage project city and code

The project create and edit forms SHALL include optional `city` and `code`
fields, send them in the project payload, and prefill them when editing.

#### Scenario: Admin creates a project with city and code

- **WHEN** an admin fills the city and code fields and saves a new project
- **THEN** both values are sent to the API and persisted

#### Scenario: Admin edits city and code

- **WHEN** an admin opens an existing project
- **THEN** the form shows its current city and code, and saving sends the
  updated values

#### Scenario: Optional fields

- **WHEN** an admin leaves city or code empty
- **THEN** the form saves successfully and the empty value is sent as `null`

### Requirement: Show discovery fields in the project list

The admin project card SHALL show the project's city (falling back to the first
address segment) and its code when present.

#### Scenario: Project with city and code

- **WHEN** the project list renders a project that has a city and a code
- **THEN** the card shows both values

#### Scenario: Legacy project

- **WHEN** a project has no city or code
- **THEN** the card falls back to the address for the location and renders no
  code chip
