## MODIFIED Requirements

### Requirement: Lots and reservations

Users with access SHALL be able to view a project's lots, admins SHALL be able
to create lots, and authorized users SHALL be able to edit lots. Sellers SHALL
be able to create reservations for available lots; the admin portal SHALL NOT
offer a reservation action to admins.

#### Scenario: View project lots

- **WHEN** an authenticated user opens `/projects/:id/lots`
- **THEN** the lot list for that project is shown

#### Scenario: Create a lot

- **WHEN** an admin opens `/projects/:id/lots/create`
- **THEN** the create-lot form is shown

#### Scenario: Seller reserves an available lot

- **WHEN** a seller views an available lot in the lot list or the lot detail
- **THEN** the lot offers a **Reservar** action

#### Scenario: Admin does not reserve lots

- **WHEN** an admin views an available lot in the admin portal
- **THEN** the lot list, lot detail, and project detail lots tab do not offer a
  reservation action
- **AND** the lot list and project detail lots tab offer a **Ver** action
  instead

### Requirement: Lot detail is a sheet

The system SHALL open a lot detail with status, dimensions, area, price,
holder, and role-appropriate actions, not a full page. Sellers SHALL see
**Reservar** for available lots. When the sheet is opened from the admin lot
list, admins SHALL see **Editar Lote** and SHALL NOT see **Reservar**.

#### Scenario: Seller reserves an available lot from the sheet

- **WHEN** a seller opens an available lot
- **THEN** the detail offers a "Reservar" action

#### Scenario: Admin opens an available lot from the admin lot list

- **WHEN** an admin opens an available lot from the admin lot list
- **THEN** the detail does not offer a "Reservar" action
- **AND** the detail offers "Editar Lote"
