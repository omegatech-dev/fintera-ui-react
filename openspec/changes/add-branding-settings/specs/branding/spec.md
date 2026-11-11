## Purpose

Let an administrator configure the application name and logo used across the
app from a dedicated admin Settings area, and make every screen reflect the
configured branding.

## ADDED Requirements

### Requirement: Admin-only settings hub

The application SHALL provide an admin-only Settings area at `/settings` that
only admins can open, and SHALL NOT show the Settings entry to non-admin users.
The hub SHALL contain a General section (`/settings/general`) and a Brand
identity section (`/settings/branding`), and `/settings` SHALL redirect to
General.

#### Scenario: Admin opens Settings

- **WHEN** an admin opens `/settings`
- **THEN** they are redirected to `/settings/general`, and the Settings entry is
  active in both sidebar variants

#### Scenario: Admin opens brand identity

- **WHEN** an admin opens `/settings/branding`
- **THEN** the brand identity form is shown with the current logos

#### Scenario: Non-admin opens Settings

- **WHEN** a seller or regular user opens `/settings` or `/settings/branding`
- **THEN** they see the forbidden page, and no Settings entry appears in either
  sidebar variant

#### Scenario: Personal settings stay available

- **WHEN** an allowed user opens `/settings/user/:userId`
- **THEN** the per-user personal settings page is shown as before

### Requirement: General settings

The General section SHALL let an admin update the application name and SHALL
show a browser-tab preview of that name.

#### Scenario: Save the application name

- **WHEN** an admin enters a new name and saves
- **THEN** the name is sent to the API, branding is refreshed, and a success
  toast confirms the update

#### Scenario: Empty name

- **WHEN** an admin submits an empty or whitespace-only name
- **THEN** saving is blocked and an inline error explains that the name is
  required

### Requirement: Brand identity and logo guidance

The Brand identity section SHALL let an admin upload a light logo, upload an
optional dark logo, and remove either logo. It SHALL show logo guidance:
recommended size 640 × 160 px (4:1), minimum 320 × 80 px, maximum file size
2 MB, accepted formats PNG/JPEG/WebP, and a preference for transparent,
horizontal wordmarks. It SHALL preview the logo in the sidebar, sign-in screen,
and browser tab before saving.

#### Scenario: Save logos

- **WHEN** an admin selects a logo and saves
- **THEN** the logo is uploaded, branding is refreshed, and a success toast
  confirms the update

#### Scenario: Dark logo is optional

- **WHEN** an admin saves only a light logo
- **THEN** the dark logo stays unchanged, and dark-mode previews use the light
  logo as fallback

#### Scenario: Remove a logo

- **WHEN** an admin removes the light logo and saves
- **THEN** the light logo is cleared and the app falls back to the bundled logo

#### Scenario: Invalid file is blocked

- **WHEN** an admin selects a file that is not PNG/JPEG/WebP or is larger than
  2 MB
- **THEN** the file is rejected with inline feedback and an error toast

#### Scenario: Size warnings are advisory

- **WHEN** an admin selects a supported image below the recommended size or with
  an unusual aspect ratio
- **THEN** a warning is shown, but the admin can still save the logo

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
