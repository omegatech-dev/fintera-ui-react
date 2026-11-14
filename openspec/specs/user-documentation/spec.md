# User Documentation

## Purpose

Give admins and sellers an in-app, bilingual guide that explains the system's
terms and operating logic, filtered to the operations each role can perform.

## Requirements

### Requirement: Staff-only guide access

The application SHALL provide a User Guide at `/docs` that only admins and
sellers can open, and SHALL NOT show the Guide entry to regular users. The Guide
entry SHALL appear in both sidebar variants for admins and sellers.

#### Scenario: Admin opens the guide

- **WHEN** an admin opens `/docs`
- **THEN** the guide is shown with every section and article available

#### Scenario: Seller opens the guide

- **WHEN** a seller opens `/docs`
- **THEN** the guide is shown with only articles tagged for sellers, and the
  sidebar entry is visible

#### Scenario: Regular user is denied

- **WHEN** a regular user opens `/docs`
- **THEN** the forbidden page is shown and no Guide entry appears in either
  sidebar variant

### Requirement: Role-filtered content

The guide SHALL filter articles by the current user's role. Seller-visible
articles SHALL cover viewing projects and lots, creating reservations, adding
clients, viewing contracts and payments, uploading receipts, reports, and
glossary terms. Shared articles MAY provide a seller-specific body; the overview
article SHALL use it so sellers see only their operations.
Admin-only articles SHALL cover approving/rejecting contracts and payments,
managing projects and lots, and settings/branding. The users article SHALL be
visible to both roles because sellers can view and create users, and SHALL note
the admin-only actions (delete, deactivate, restore).

#### Scenario: Seller cannot see admin-only operations

- **WHEN** a seller browses the guide
- **THEN** articles about approvals, project management, and settings are not
  listed and are not reachable from the guide navigation

#### Scenario: Seller sees a seller-only overview

- **WHEN** a seller opens `/docs/overview-and-roles`
- **THEN** the article lists only the operations available to sellers, such as
  creating reservations, adding clients, sharing the referral link, registering
  collections, and reading commissions
- **AND** it does not show the admin menu

#### Scenario: Admin sees the full guide

- **WHEN** an admin browses the guide
- **THEN** both shared and admin-only articles are listed

### Requirement: Categorized navigation and search

The guide SHALL group articles into sections and SHALL provide a search box that
filters the visible articles by title and body text.

#### Scenario: Search filters articles

- **WHEN** a user types a term such as "moratory" in the search box
- **THEN** the article list shows only matching visible articles

#### Scenario: Empty search result

- **WHEN** the search text matches no article
- **THEN** the guide shows a "no results" message instead of stale results

### Requirement: Article reading and table of contents

Selecting an article SHALL render its markdown, including GitHub-flavored tables
and lists, and SHALL show a table of contents generated from the article's
second- and third-level headings that links to those headings.

#### Scenario: Article renders markdown

- **WHEN** a user selects an article that contains a table
- **THEN** the table is rendered as an HTML table

#### Scenario: Table of contents links to headings

- **WHEN** an article has two or more headings
- **THEN** the table of contents lists them and each entry links to the matching
  heading anchor

### Requirement: Bilingual content

The guide SHALL render titles and article bodies in the active locale (`en` or
`es`) and SHALL fall back to the other locale when a translation is missing.

#### Scenario: Locale switch updates content

- **WHEN** the active locale is Spanish
- **THEN** article titles and bodies are shown in Spanish
- **AND WHEN** the user switches to English
- **THEN** the same article is shown in English

### Requirement: Terms and operation logic

The guide SHALL explain domain terms and operation logic, including a glossary
and an article documenting the overdue-interest formula and the payment-schedule
generation rules.

#### Scenario: Glossary defines terms

- **WHEN** a user opens the Glossary
- **THEN** terms such as reservation, down payment, financing type, moratory
  interest, readjustment, and credit score are defined

#### Scenario: Overdue-interest formula is documented

- **WHEN** a user opens the overdue-interest article
- **THEN** the article states that interest equals the installment amount
  multiplied by the days overdue divided by 365, multiplied by the project
  interest rate as a decimal, applies only to installments on approved active
  contracts, and that a project rate of zero produces no interest
