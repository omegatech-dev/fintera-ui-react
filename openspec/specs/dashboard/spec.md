# Dashboard

## Purpose

Provide an authenticated landing view at `/` that summarizes activity and
offers role-appropriate quick actions.

## Requirements

### Requirement: Authenticated landing view

The application SHALL render a dashboard at `/` for authenticated users.

#### Scenario: Admin lands on the app

- **WHEN** an authenticated admin opens `/`
- **THEN** an action center is shown: overdue amounts, payments to approve,
  contracts to approve, and reservations without a contract
- **AND** each item links to its filtered list

#### Scenario: Seller lands on the app

- **WHEN** an authenticated seller opens `/`
- **THEN** a "Mi día" home is shown with today's collections, monthly sales,
  estimated commission and active clients

### Requirement: Seller quick actions

The seller's **My day** header SHALL offer **New reservation** and **Create
client** actions. **New reservation** SHALL open the projects list so the seller
can choose an available lot. **Create client** SHALL open the historical client
form.

#### Scenario: Seller starts a reservation

- **WHEN** a seller selects **New reservation**
- **THEN** the projects list opens to choose a lot

#### Scenario: Seller adds a client

- **WHEN** a seller selects **Create client**
- **THEN** the historical client form opens

### Requirement: Data loading and error states

The dashboard SHALL show a loading state while data is fetched and a message
when loading fails, without crashing the page.

#### Scenario: Dashboard API failure

- **WHEN** a dashboard data request fails
- **THEN** the page shows an error message
- **AND** the rest of the app remains usable
