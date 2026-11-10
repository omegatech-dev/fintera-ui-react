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

### Requirement: Project edit actions appear after all content

The project edit page SHALL place the **Back** and **Save changes** actions
after the project form fields, the payment-instructions link, the drawings
panel, and the photos panel, so they are the final interactive elements on the
page.

#### Scenario: Admin reaches the end of the project edit page

- **WHEN** an admin opens `/projects/:id/edit`
- **THEN** the Back and Save changes actions are rendered after the media
  panels
- **AND** no duplicate form submit action is rendered above the media panels

#### Scenario: Saving from the final actions

- **WHEN** an admin changes a project field and activates Save changes in the
  final action row
- **THEN** the project update request is sent with the edited values
- **AND** the admin is taken back to the project list on success

### Requirement: Scoped media upload guidance

Each media panel SHALL show only the rules for the file types it accepts. The
drawings panel SHALL describe DWG, DXF, PDF, and SVG files up to 50 MB each. The
photo gallery SHALL describe JPEG, PNG, and WebP files up to 10 MB each.

#### Scenario: Drawings panel guidance

- **WHEN** an admin views the project drawings panel
- **THEN** the hint mentions only DWG, DXF, PDF, SVG, and the 50 MB limit
- **AND** it does not mention photo formats or the 10 MB limit

#### Scenario: Photo gallery guidance

- **WHEN** an admin views a project or lot photo gallery
- **THEN** the hint mentions only JPEG, PNG, WebP, and the 10 MB limit
- **AND** it does not mention drawings or the 50 MB limit

### Requirement: Drag-and-drop photo upload

The project and lot photo galleries SHALL provide a drag-and-drop zone that also
opens the file picker when activated, accepts multiple JPEG, PNG, or WebP files
up to 10 MB each, and uploads valid files without a separate confirmation step.

#### Scenario: Drop valid photos

- **WHEN** an admin drops one or more valid image files onto the photo zone
- **THEN** the files are validated and uploaded to the project or lot photo
  endpoint
- **AND** the gallery refreshes with the new photos

#### Scenario: Choose photos with the picker

- **WHEN** an admin clicks the photo zone and selects valid image files
- **THEN** the same upload flow runs as when files are dropped

#### Scenario: Reject invalid photos

- **WHEN** an admin drops or selects a file whose type is not JPEG, PNG, or WebP,
  or whose size exceeds 10 MB
- **THEN** the file is not uploaded
- **AND** the zone lists the file with the reason it was rejected

#### Scenario: Non-admin cannot upload

- **WHEN** a user without media-management permission views a photo gallery
- **THEN** the upload zone is not available
- **AND** existing photos remain visible

### Requirement: Single action row on lot create and edit

The lot create and edit pages SHALL expose one action row containing Back and
Save changes, placed at the end of the form, so the same pattern is used as the
project edit page.

#### Scenario: Admin edits a lot

- **WHEN** an admin opens the lot edit page
- **THEN** exactly one Back action and one Save changes action are rendered
- **AND** both appear at the end of the form content

#### Scenario: Admin creates a lot

- **WHEN** an admin opens the lot create page
- **THEN** exactly one Back action and one Create action are rendered
- **AND** both appear at the end of the form content
