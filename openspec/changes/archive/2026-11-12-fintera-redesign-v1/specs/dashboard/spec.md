## MODIFIED Requirements

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
