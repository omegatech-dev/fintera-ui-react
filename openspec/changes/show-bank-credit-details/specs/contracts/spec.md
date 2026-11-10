## Purpose

Keep the admin contract details consistent with the financing information the
customer reports in the portal.

## ADDED Requirements

### Requirement: Show bank financing details

The contract details Financial tab SHALL show the customer's bank and credit
status when `financing_type` is `bank`.

#### Scenario: Bank contract with details

- **WHEN** an admin opens a bank contract that has a bank name and a credit
  status
- **THEN** the Financial tab shows both values with friendly labels

#### Scenario: Bank contract without details

- **WHEN** a bank contract has no bank name or credit status
- **THEN** both fields render `—`

#### Scenario: Non-bank contract

- **WHEN** an admin opens a direct or cash contract
- **THEN** the bank block is not rendered

### Requirement: Edit bank financing details

The Financial tab SHALL let an admin update the bank name and credit status and
send them through the existing contract update endpoint.

#### Scenario: Admin edits the bank

- **WHEN** an admin changes the bank name and saves the financial form
- **THEN** the payload includes the new `bank_name` and the contract refreshes

#### Scenario: Admin clears the credit status

- **WHEN** an admin selects the empty option for the credit status
- **THEN** the payload sends `null` and the field shows `—` afterwards
