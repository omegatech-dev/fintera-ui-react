# Analytics

## Purpose

Provide financial and sales analytics with charts, filters, seller performance,
and export options.

## Requirements

### Requirement: Analytics overview

The analytics page SHALL show summary statistics, revenue trends, distribution,
monthly performance, and seller performance for the selected filters.

#### Scenario: Load analytics

- **WHEN** an authenticated user opens `/analytics`
- **THEN** the analytics charts and summary statistics are displayed

### Requirement: Filtering and export

The analytics page SHALL support project and date filters and SHALL let the
user export the current analytics data.

#### Scenario: Export data

- **WHEN** the user chooses an export option
- **THEN** the current analytics data is downloaded
