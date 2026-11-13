# Audits

## Purpose

Provide an auditable timeline of changes across contracts, lots, users,
projects, and payments, with search, filtering, and pagination.

## Requirements

### Requirement: Audit timeline

The audits page SHALL display audit entries as a timeline ordered by creation
date, newest first.

#### Scenario: Open audits

- **WHEN** an authenticated user opens `/audits`
- **THEN** audit entries are shown in a timeline ordered by creation date, newest first

### Requirement: Audit search and filtering

The audits page SHALL support searching and filtering by model and SHALL
paginate results.

#### Scenario: Filter by model

- **WHEN** the user selects the `Contract` model filter
- **THEN** only contract audit entries are shown

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
