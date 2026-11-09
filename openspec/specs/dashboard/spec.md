# Dashboard

## Purpose

Provide an authenticated landing view at `/` that summarizes activity and
offers role-appropriate quick actions.

## Requirements

### Requirement: Authenticated landing view

The application SHALL render a dashboard at `/` for authenticated users.

#### Scenario: Admin lands on the app

- **WHEN** an authenticated admin opens `/`
- **THEN** the admin dashboard with quick actions and recent activity is shown

#### Scenario: Seller lands on the app

- **WHEN** an authenticated seller opens `/`
- **THEN** the seller dashboard with commission and performance data is shown

### Requirement: Data loading and error states

The dashboard SHALL show a loading state while data is fetched and a message
when loading fails, without crashing the page.

#### Scenario: Dashboard API failure

- **WHEN** a dashboard data request fails
- **THEN** the page shows an error message
- **AND** the rest of the app remains usable
