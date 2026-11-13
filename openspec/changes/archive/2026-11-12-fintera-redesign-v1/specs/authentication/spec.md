## ADDED Requirements

### Requirement: Signup is admin-only
The system SHALL restrict `/signup` to admins (or remove it). Public account
creation SHALL happen in the customer portal, and back-office accounts SHALL be
created via `/users/create`.

#### Scenario: Public signup is not offered in the back office
- **WHEN** an unauthenticated user opens `/signup`
- **THEN** they are redirected to sign in, not to a public registration form

### Requirement: Reset uses the shared dialog
The system SHALL implement forgot-password and terms modals through the shared
dialog (role dialog, aria-modal, Escape, focus trap).

#### Scenario: Reset dialog is accessible
- **WHEN** the reset dialog opens
- **THEN** it is labelled, traps focus and closes on Escape

### Requirement: Post-login destination is unchanged
The system SHALL keep the existing post-login destination logic for admins,
sellers and customers.

#### Scenario: Customer is sent to the portal
- **WHEN** a customer signs in
- **THEN** they are sent to the customer portal, not the admin dashboard

### Requirement: Seller routes use SellerRoute
The application SHALL gate seller routes (`/vendedor/*`) so that admins and
sellers can access them and other roles cannot.

#### Scenario: Seller opens a seller route
- **WHEN** a seller opens `/vendedor/cobros`
- **THEN** the page renders

#### Scenario: Admin opens a seller route
- **WHEN** an admin opens `/vendedor/cobros`
- **THEN** the page renders
