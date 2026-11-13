# Authentication

## Purpose

Authenticate users, keep their session current, and restrict pages by role so
that only authorized users can access protected or administrative areas.

## Requirements

### Requirement: Protected pages require a session

The application SHALL redirect unauthenticated users to `/signin` and preserve
the attempted location for post-login navigation.

#### Scenario: Unauthenticated navigation

- **WHEN** a user without a token opens a protected route such as `/projects`
- **THEN** the app redirects to `/signin`

### Requirement: First login requires a password change

When the authenticated user has `must_change_password` set, the application
SHALL redirect them to `/settings/user/:id/security` until the password is
changed.

#### Scenario: First-login redirect

- **WHEN** a user with `must_change_password` opens a protected page other than the security page
- **THEN** the app redirects to that user's security settings

### Requirement: Role-based route access

The application SHALL allow admin-only routes only for users with role `admin`,
and admin-or-owner routes only for admins or the user matching `:userId`.

#### Scenario: Non-admin opens an admin route

- **WHEN** a non-admin user opens `/projects/create`
- **THEN** the app redirects to `/projects`

#### Scenario: Owner opens their own settings

- **WHEN** a non-admin user opens `/settings/user/:userId` for their own id
- **THEN** the app renders the settings page

### Requirement: Unauthorized responses end the session

When the API returns `401`, the application SHALL dispatch the
`auth:unauthorized` event and clear the stored session.

#### Scenario: Expired token

- **WHEN** an API request returns `401`
- **THEN** the app clears the token, refresh token, and user data
- **AND** the user returns to the sign-in flow

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
