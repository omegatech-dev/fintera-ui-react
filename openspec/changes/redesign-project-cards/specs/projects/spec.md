## ADDED Requirements

### Requirement: Project cards lead with the gallery

Project cards SHALL render the project gallery as the primary visual element in
a 16:10 carousel at the top of the card.

#### Scenario: Project has multiple photos

- **WHEN** the project response includes at least two `photos`
- **THEN** the card shows the first photo
- **AND** the card provides previous and next controls, a photo counter, and
  swipe navigation

#### Scenario: Project has one photo

- **WHEN** the project response includes one `photos` entry or only
  `cover_photo_url`
- **THEN** the card shows that photo without carousel navigation controls

#### Scenario: Project has no photos

- **WHEN** the project response has neither `photos` nor `cover_photo_url`
- **THEN** the card shows the existing success gradient placeholder with a home
  icon

### Requirement: Project identity is readable over the photo

Project cards SHALL show the project name, city, publication state, and project
type over the carousel.

#### Scenario: Complete project card

- **WHEN** a project card renders with a name, city, publication state, and type
- **THEN** the name and city appear over the photo
- **AND** the publication badge and project type chip remain visible

#### Scenario: Missing city

- **WHEN** the project has no city
- **THEN** the card falls back to the address
- **AND** shows a localized "location not set" label when both are missing

### Requirement: Project metadata is organized for scanning

Project cards SHALL group delivery date, creation date, code, and GUID into a
compact metadata area instead of a vertical list.

#### Scenario: Full metadata

- **WHEN** the project has delivery date, creation date, code, and GUID
- **THEN** delivery and creation dates appear as labeled values in a two-column
  grid
- **AND** the code appears as a compact chip
- **AND** an info button reveals the full GUID in a details panel
- **AND** the details panel copies the full GUID when its copy action is used

#### Scenario: Partial metadata

- **WHEN** delivery date, creation date, code, or GUID is missing
- **THEN** only the available values are rendered
- **AND** the remaining layout does not leave empty labeled blocks

### Requirement: Card carousel is accessible

The gallery carousel SHALL be usable without a pointer and SHALL provide
localized accessible names for its controls.

#### Scenario: Keyboard navigation

- **WHEN** a keyboard user focuses the carousel controls and activates next or
  previous
- **THEN** the visible photo changes

#### Scenario: Screen reader labels

- **WHEN** the carousel renders
- **THEN** previous, next, photo counter, and image alt text are exposed through
  localized labels
