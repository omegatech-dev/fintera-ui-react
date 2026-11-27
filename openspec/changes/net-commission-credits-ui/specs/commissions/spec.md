## MODIFIED Requirements

### Requirement: Admin can pay a commission

The system SHALL allow an admin to mark a commission as paid from its row action
through `PATCH /api/v1/contracts/:guid/commission/pay`, recording the payment
date and actor, writing an audit event, and leaving the contract balance
unchanged. When commission-credit netting is enabled, the payout SHALL apply
available credits for the same seller and report the gross commission, applied
credit total, net cash amount, and remaining seller credit balance. The server
response SHALL be authoritative for the final payout. Paying twice SHALL be
rejected.

#### Scenario: Admin pays a pending commission with netting enabled

- **WHEN** an admin opens the payout action for a pending commission and the
  backend preview reports netting enabled
- **THEN** the UI shows the gross commission, credit amount to apply, and net
  cash amount before confirmation
- **AND** after confirmation, the UI shows the payout breakdown returned by the
  server and refreshes the report
- **AND** the contract balance is unchanged

#### Scenario: Netting is disabled

- **WHEN** an admin opens the payout action and the backend preview reports
  `enabled: false`
- **THEN** the UI shows the existing gross commission amount without implying
  that a credit was applied
- **AND** the commission can be paid through the existing endpoint

#### Scenario: Payout preview cannot be loaded

- **WHEN** an admin opens the payout action and the preview request fails
- **THEN** the UI shows an error
- **AND** the payout cannot be confirmed until a preview is available

#### Scenario: Preview changes before confirmation

- **WHEN** a commission is paid after the preview was loaded and the server
  returns a different final breakdown
- **THEN** the UI displays the final breakdown from the payment response rather
  than treating the preview as authoritative

#### Scenario: Already paid

- **WHEN** an admin tries to pay a commission that is already paid
- **THEN** the API rejects the request and the UI does not change the row

### Requirement: Seller commissions are read-only

The system SHALL show a seller their own commissions with period total, pending
amount and paid amount, without any payout action. The seller view SHALL also
show the seller's remaining commission-credit balance and the application
history returned for those credits, without offering a credit settlement or
payout action.

#### Scenario: Seller cannot pay a commission

- **WHEN** a seller views `/vendedor/comisiones`
- **THEN** no "Marcar pagada" action is available

#### Scenario: Seller views credit balance and applications

- **WHEN** a seller views `/vendedor/comisiones` and has commission credits
- **THEN** the UI shows the remaining balance and any application details
  returned by the backend
- **AND** the information is read-only

## ADDED Requirements

### Requirement: Commission credits show remaining balance and traceable applications

The commissions views SHALL show each credit's original amount, amount already
applied, remaining amount, source, and active applications when supplied by the
backend. The views SHALL use the backend's global seller balance rather than
subtracting historical credits from a period's pending commissions. The admin
view SHALL NOT offer a manual action that marks a credit settled without a
recorded application or payment.

#### Scenario: Admin reviews credit balances

- **WHEN** an admin views commissions with pending or partially applied credits
- **THEN** the UI shows each credit's remaining amount and its active
  applications, including the destination contract and applied amount
- **AND** the seller balance is shown separately from period commission totals

#### Scenario: No manual apply action

- **WHEN** an admin views a pending commission credit
- **THEN** no "Apply credit" action is offered from the commission view

#### Scenario: No credits

- **WHEN** a seller or admin has no remaining commission-credit balance
- **THEN** the UI shows a zero balance without presenting a negative
  "net payable" value derived from period commissions minus global credits
