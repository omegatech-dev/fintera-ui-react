## ADDED Requirements

### Requirement: One model filter and one action filter
The system SHALL provide two distinct filters (model and action) instead of two
filters sharing the same label.

#### Scenario: Filters are distinguishable
- **WHEN** an admin opens the audit page
- **THEN** the model and action filters have different labels

### Requirement: Event copy is past tense and translated
The system SHALL render audit events as actor + past-tense verb + object, fully
translated in the active locale.

#### Scenario: Event reads as history
- **WHEN** an admin cancels a contract
- **THEN** the audit reads "canceló el contrato #16" in Spanish and "cancelled
contract #16" in English

## REMOVED Requirements

### Requirement: Untranslated action keys and debug identifiers
**Reason**: Untranslated or internal strings were shown to users.
**Migration**: Localize every event key and remove internal identifiers.
