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
