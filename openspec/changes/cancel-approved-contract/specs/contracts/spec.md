## MODIFIED Requirements

### Requirement: Contract lifecycle actions

Authorized users SHALL be able to approve, reject and cancel a contract, and the
interface SHALL reflect the new state after success. Cancel SHALL be available
for approved and signed contracts. There SHALL be no reopen action.

Approve SHALL be a direct, visible primary action in the contract list and in
the contract detail header, not hidden behind an overflow menu that can be
clipped by table scroll containers. Reject, cancel and delete SHALL live in the
actions menu, separated from non-destructive actions.

#### Scenario: Approve a contract from the list

- **WHEN** an authorized user approves a pending contract
- **THEN** the contract status becomes approved
- **AND** the list and statistics refresh
- **AND** the success feedback names the result

#### Scenario: Approve a contract from the detail

- **WHEN** an authorized user opens a pending contract's detail
- **THEN** an Approve primary action is visible in the header
- **AND** the detail reloads the contract after success

#### Scenario: Approval fails

- **WHEN** the approval request fails
- **THEN** the user sees an error message
- **AND** the contract is reloaded so a partially successful approval is shown
  as approved instead of stale pending

#### Scenario: Reject a contract

- **WHEN** an authorized user rejects a contract with a reason
- **THEN** the contract status becomes rejected
- **AND** the reason is stored with the contract

#### Scenario: Cancel an approved contract

- **WHEN** an admin cancels an approved contract
- **THEN** a confirmation explains the consequences (future installments
  cancelled, paid amount refunded, lot released, commission credit when paid)
- **AND** the contract becomes cancelled

#### Scenario: Cancel a signed contract

- **WHEN** an admin cancels a signed contract
- **THEN** the contract becomes cancelled with the same confirmation

#### Scenario: No reopen action

- **WHEN** an admin opens a cancelled or closed contract
- **THEN** no reopen action is shown
