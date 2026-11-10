## ADDED Requirements

### Requirement: Project cards show publication state

Project cards in the admin project list SHALL show whether each project is
published, using a visible status badge.

#### Scenario: Published project card

- **WHEN** the project list renders a project with `is_published: true`
- **THEN** the card shows a "Publicado" badge

#### Scenario: Unpublished project card

- **WHEN** the project list renders a project with `is_published: false`
- **THEN** the card shows a "No publicado" badge

### Requirement: Admins can publish and unpublish from the card and edit page

Admin users SHALL be able to publish or unpublish a project from the project card
and from the project edit page. The action SHALL call the matching publish or
unpublish endpoint and reflect the new state.

#### Scenario: Publish from the card

- **WHEN** an admin clicks the publish action on an unpublished project card
- **THEN** the publish endpoint is called
- **AND** the card updates to the published state

#### Scenario: Unpublish from the card

- **WHEN** an admin clicks the unpublish action on a published project card
- **THEN** the unpublish endpoint is called
- **AND** the card updates to the unpublished state

#### Scenario: Toggle from the edit page

- **WHEN** an admin changes the visibility toggle on the project edit page
- **THEN** the matching publish or unpublish endpoint is called
- **AND** the edit page reflects the returned state

#### Scenario: Non-admin

- **WHEN** a non-admin views a project card or the edit page
- **THEN** no publish or unpublish control is shown

### Requirement: Project cards link to the public portal

Published project cards SHALL expose the project's public portal link using its
GUID.

#### Scenario: Published project with a portal URL configured

- **WHEN** a published project card renders and a public portal URL is configured
- **THEN** the card shows a link that opens the project's public page using its GUID

#### Scenario: No public portal URL configured

- **WHEN** the public portal URL is not configured
- **THEN** the card still shows the GUID with the existing copy action and no
  broken link

### Requirement: Project cards use the cover photo

Project cards SHALL use the first gallery photo as their header image.

#### Scenario: Project has a cover photo

- **WHEN** a project response includes `cover_photo_url`
- **THEN** the card header renders that image

#### Scenario: Project has no cover photo

- **WHEN** a project response has no `cover_photo_url`
- **THEN** the card header uses the existing gradient placeholder
