# Projects and Lots

## Purpose

Let authorized users browse, create, edit, and import real-estate projects and
manage the lots and reservations that belong to each project.

## Requirements

### Requirement: Project list with search, sort, and pagination

The projects page SHALL list projects with server-side search, sorting, and
pagination, and SHALL show loading, empty, and error states.

#### Scenario: Search by name

- **WHEN** the user enters a non-UUID search term
- **THEN** the request includes `search_term`
- **AND** the list shows matching projects for the current page

#### Scenario: Search by identifier

- **WHEN** the user enters a UUID
- **THEN** the request includes `guid`

### Requirement: Admin-only project management

Creating, editing, and importing projects SHALL be available only to admins.

#### Scenario: Admin opens create project

- **WHEN** an admin navigates to `/projects/create`
- **THEN** the create-project form is shown

#### Scenario: Non-admin opens create project

- **WHEN** a non-admin navigates to `/projects/create`
- **THEN** the app redirects to `/projects`

### Requirement: Lots and reservations

Users with access SHALL be able to view a project's lots, admins SHALL be able
to create lots, and authorized users SHALL be able to edit lots and create
reservations.

#### Scenario: View project lots

- **WHEN** an authenticated user opens `/projects/:id/lots`
- **THEN** the lot list for that project is shown

#### Scenario: Create a lot

- **WHEN** an admin opens `/projects/:id/lots/create`
- **THEN** the create-lot form is shown
