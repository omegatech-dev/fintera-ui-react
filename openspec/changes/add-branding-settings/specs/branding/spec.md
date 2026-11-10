## Purpose

Let an administrator configure the application name and logo used across the
app, and make every screen reflect the configured branding.

## ADDED Requirements

### Requirement: Admin-only branding page

The application SHALL provide a branding page at `/settings/branding` that only
admins can open, and SHALL NOT show a link to it for non-admin users.

#### Scenario: Admin opens branding

- **WHEN** an admin navigates to `/settings/branding`
- **THEN** the branding form is shown with the current name and logos

#### Scenario: Non-admin opens branding

- **WHEN** a seller or regular user opens `/settings/branding`
- **THEN** they are redirected away, and no Branding entry appears in either
  sidebar variant

### Requirement: Update name and logos

The branding page SHALL let an admin save a new application name, upload a
light logo, upload an optional dark logo, and remove either logo.

#### Scenario: Save name and logos

- **WHEN** an admin enters a name, selects a light logo image, and saves
- **THEN** the name and logo are sent to the API, and a success toast confirms
  the update

#### Scenario: Dark logo is optional

- **WHEN** an admin saves only a light logo and name
- **THEN** the dark logo stays unchanged

#### Scenario: Remove a logo

- **WHEN** an admin removes the light logo and saves
- **THEN** the light logo is cleared and the app falls back to the bundled logo

#### Scenario: Validation feedback

- **WHEN** the name is empty or a selected file is not a supported image
- **THEN** the save is blocked or an error toast explains the problem

### Requirement: Branding applied across the app

The application SHALL render the configured logo in the expanded sidebar,
collapsed sidebar, login header, and signup page, and SHALL use the configured
name for the browser tab title and the login footer copyright.

#### Scenario: Custom logo replaces bundled assets

- **WHEN** a custom light logo is configured and a user opens the dashboard
- **THEN** the sidebar shows the custom logo instead of the bundled asset

#### Scenario: Dark mode uses the dark variant

- **WHEN** dark mode is active and a dark logo is configured
- **THEN** the sidebar and auth screens show the dark variant

#### Scenario: Name applied

- **WHEN** the configured name is "Acme" and a user loads the app
- **THEN** the browser tab title contains "Acme" and the login footer shows an
  "Acme" copyright

### Requirement: Fallback branding

When the API is unreachable, returns an error, or has no custom branding, the
application SHALL use the bundled name "Fintera" and the bundled logo assets,
and SHALL keep working normally.

#### Scenario: API unavailable at startup

- **WHEN** the branding request fails while the app loads
- **THEN** the app renders with the bundled name and logos instead of crashing

#### Scenario: No custom branding

- **WHEN** the API returns null logo URLs
- **THEN** the bundled logo assets are shown
