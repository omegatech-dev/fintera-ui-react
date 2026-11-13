## ADDED Requirements

### Requirement: Comparison deltas are guarded
The analytics page SHALL NOT show a fabricated percentage when the previous
period has no data, and SHALL show a neutral message instead.

#### Scenario: No previous period
- **WHEN** the previous period has no data for a statistic
- **THEN** the comparison shows "sin datos del mes anterior" instead of a percentage

### Requirement: Charts are accessible
The analytics page SHALL give every chart an accessible name and a text
alternative.

#### Scenario: Chart has an accessible name
- **WHEN** a chart renders
- **THEN** it exposes an accessible name and a data-table alternative

### Requirement: Overdue summary links to payments
The analytics page SHALL surface a mora card that links to the overdue payments
filter.

#### Scenario: Mora card links out
- **WHEN** the user selects the mora card
- **THEN** they land on the payments list filtered to overdue
