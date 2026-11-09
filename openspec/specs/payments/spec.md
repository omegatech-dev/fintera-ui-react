# Payments

## Purpose

Review and act on contract payments, including approvals, rejections, receipt
handling, and payment statistics.

## Requirements

### Requirement: Payment list with filters

The payments page SHALL list payments with search, status, and date filters,
pagination, and summary statistics.

#### Scenario: Filter by date range

- **WHEN** the user sets a start and end date
- **THEN** the list shows payments within that range

### Requirement: Payment approval and rejection

Authorized users SHALL be able to approve or reject a payment and SHALL see the
updated state after the action.

#### Scenario: Approve a payment

- **WHEN** an authorized user approves a pending payment
- **THEN** the payment is marked approved
- **AND** the payment statistics refresh

#### Scenario: Reject a payment

- **WHEN** an authorized user rejects a payment
- **THEN** the payment status reflects the rejection

### Requirement: Receipt handling

The application SHALL allow downloading a payment receipt as a file and
uploading a receipt for a payment.

#### Scenario: Download receipt

- **WHEN** the user requests the receipt for a payment
- **THEN** the API response is downloaded as a blob

#### Scenario: Upload receipt

- **WHEN** the user uploads a receipt file
- **THEN** the request is sent as multipart form data
