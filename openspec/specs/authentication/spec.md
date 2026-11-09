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
