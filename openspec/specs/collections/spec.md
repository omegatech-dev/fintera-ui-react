# Collections

## Purpose

Lets sellers see their clients, outstanding collections and contracts, and
upload a proof for an installment while keeping approval and the balance with
admins.

## Requirements

### Requirement: Seller workspace

The system SHALL provide `/vendedor/clientes`, `/vendedor/cobros` and
`/vendedor/documentos` behind `SellerRoute`, scoped to the contracts the seller
created. The three views SHALL share a tab bar and a search field.

#### Scenario: Seller opens the workspace

- **WHEN** a seller opens "Mi espacio"
- **THEN** the clients tab lists the clients from their own contracts
- **AND** the cobros tab lists contracts with an outstanding balance

#### Scenario: Another role opens a seller route

- **WHEN** a role other than admin or seller opens `/vendedor/cobros`
- **THEN** the forbidden page is shown

### Requirement: Collection queue

The system SHALL list the seller's active contracts with a non-zero balance,
sorted by the next installment due date, showing client, project/lot, the next
installment (amount, type label and due date) as the primary amount, and the
outstanding balance as secondary context. Each row SHALL expose one
"Registrar cobro" action.

#### Scenario: Queue excludes settled contracts

- **WHEN** a contract has no outstanding balance
- **THEN** it does not appear in the collection queue

#### Scenario: Queue shows the next installment, not the balance

- **WHEN** a direct contract has a reservation or first installment pending
- **THEN** the row shows that installment amount and label (Reserva, Prima,
  Cuota N, Total or Abono a capital) with its due date
- **AND** the contract balance is shown as secondary text

### Requirement: Next installment comes from the API

The contract list endpoint SHALL include `next_payment` (payment id, amount,
due date, payment type, label, status and receipt state) for each contract.
The next payment SHALL be the earliest pending or submitted payment without a
receipt. The seller UI SHALL NOT fetch every contract detail to find it.

#### Scenario: No extra per-contract requests

- **WHEN** a seller opens `/vendedor/cobros`
- **THEN** the table renders from the list payload only
- **AND** opening the collection dialog does not call the contract detail
  endpoint when `next_payment` is present

#### Scenario: No pending installment

- **WHEN** an active contract has no pending or submitted payment without a
  receipt
- **THEN** the row shows "Sin cuota pendiente"
- **AND** the collect action is disabled

### Requirement: Register collection captures the proof

The system SHALL open a dialog with the client, the exact `next_payment`
returned by the list (same `payment.id`), its amount, type and due date, plus a
receipt picker. Submitting SHALL upload the receipt to that payment through the
existing receipt endpoint. Partial amounts are not entered by the seller; the
admin records the approved amount later.

#### Scenario: Seller uploads a receipt

- **WHEN** a seller selects a file and sends it
- **THEN** the receipt is uploaded for the same payment id shown in the row
- **AND** the payment moves to "En revisión"

### Requirement: Result is "En revisión"

The system SHALL mark the payment as submitted after upload and SHALL NOT change
the contract balance until an admin approves it.

#### Scenario: Seller cannot approve

- **WHEN** a seller uploads a collection receipt
- **THEN** the payment shows "En revisión" and the balance is unchanged

### Requirement: The actor is audited

The system SHALL write an audit event with the seller who uploaded the receipt.

#### Scenario: Audit records the seller

- **WHEN** a collection receipt is uploaded
- **THEN** an audit event names the seller, the payment and "UPLOAD_RECEIPT"

### Requirement: Documents view

The system SHALL list the seller's contracts and link each row to the contract
detail "Documentos" tab, where payment receipts are listed.

#### Scenario: Seller reviews documents

- **WHEN** a seller opens the documents tab
- **THEN** each contract links to `/contracts/:guid?tab=documentos`
