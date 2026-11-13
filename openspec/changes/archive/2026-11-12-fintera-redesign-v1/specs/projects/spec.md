## ADDED Requirements

### Requirement: Project has a detail page
The system SHALL provide `/projects/:id` with status, facts (code, location,
delivery, lots), tabs (Resumen, Lotes, Medios, Instrucciones de pago, Actividad),
description, availability and recent activity.

#### Scenario: Detail shows the facts strip
- **WHEN** a project is opened
- **THEN** code, location, delivery and lot counts are visible

### Requirement: Project media is managed in one tab
The system SHALL provide a Medios tab for photos, planos and documents, with
upload and delete via a confirmation that names the file.

#### Scenario: Delete names the file
- **WHEN** an admin deletes a photo
- **THEN** a confirmation names the file before it is removed

### Requirement: CSV import is a sheet
The system SHALL provide an import sheet with a dropzone, template download,
update/skip toggles, a column-mapping preview and the import count in the CTA.

#### Scenario: Import shows mapping and count
- **WHEN** an admin opens the import sheet
- **THEN** the column mapping and the number of projects to import are visible

### Requirement: Lot detail is a sheet
The system SHALL open a lot detail with status, dimensions, area, price,
holder and actions (Reservar/Editar/Ver contrato), not a full page.

#### Scenario: Available lot can be reserved
- **WHEN** a lot is available
- **THEN** the detail offers a "Reservar" action
