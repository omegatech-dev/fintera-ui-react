## ADDED Requirements

### Requirement: Capital repayment submission

The contract payment schedule SHALL let authorized staff apply a capital
repayment to an approved contract with a positive amount. The request SHALL
send the amount using the field name documented by the API, and invalid input
SHALL be blocked before the request is sent.

#### Scenario: Apply a valid capital repayment

- **WHEN** an authorized user enters a positive amount and submits the capital
  repayment
- **THEN** the request sends `capital_repayment_amount` with that value
- **AND** the contract details refresh with the updated balance

#### Scenario: Missing or non-positive amount

- **WHEN** the amount is empty, zero, negative, or not a number
- **THEN** the interface shows a validation message
- **AND** no request is sent

#### Scenario: API rejects the repayment

- **WHEN** the API returns an error such as a non-approved contract or an
  invalid amount
- **THEN** the panel shows the returned message
- **AND** the amount field stays available to correct it
