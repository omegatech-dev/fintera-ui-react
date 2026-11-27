# fix-branding-logo-refresh Delta Specs

## MODIFIED Requirements

### Requirement: Brand identity and logo guidance

The Brand identity section SHALL let an admin upload a light logo, upload an
optional dark logo, and remove either logo. It SHALL show logo guidance:
recommended size 640 × 160 px (4:1), minimum 320 × 80 px, maximum file size
2 MB, accepted formats PNG/JPEG/WebP, and a preference for transparent,
horizontal wordmarks. It SHALL preview the logo in the sidebar and sign-in
screen before saving.

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

## ADDED Requirements

### Requirement: Branding writes are visible immediately

The application SHALL reflect the branding returned by a write (name save,
logo upload, logo removal) without waiting for the public branding cache to
expire.

#### Scenario: Upload a logo with a warm cache

- **WHEN** an admin uploads a light logo and the API returns the new `logo_url`
- **THEN** the sidebar, the upload card, and the live preview show the new logo
- **AND** a stale `GET /api/v1/branding` response does not restore the bundled
  logo

#### Scenario: Rename with a warm cache

- **WHEN** an admin renames the application and the API returns the new
  `app_name`
- **THEN** the tab title, the sidebar label, and the save bar reflect the new
  name immediately

#### Scenario: Reload right after a save

- **WHEN** the admin reloads the app within 60 seconds of saving
- **THEN** the saved logo and name are shown, not the cached pre-save branding

### Requirement: Browser tab preview uses the bundled favicon

The General settings tab preview SHALL show the bundled favicon, not the
configured 4:1 logo, because the browser icon is not derived from the wordmark.

#### Scenario: Custom logo configured

- **WHEN** an admin opens `/settings/general` with a custom logo configured
- **THEN** the tab preview shows the bundled `/pwa-64x64.png` icon next to the
  name

### Requirement: Monogram favicon under custom branding

The admin SHALL keep the bundled favicon by default and SHALL swap it for a
generated monogram of the configured application name when custom branding is
active. The configured logo URL SHALL NOT be used as the favicon.

#### Scenario: No custom branding

- **WHEN** no custom logo and no custom application name are configured
- **THEN** the document keeps the bundled `/favicon.ico` and `/pwa-64x64.png`
  links

#### Scenario: Custom branding configured

- **WHEN** the branding is customized with a custom logo or a custom
  `app_name`
- **THEN** the favicon is a monogram generated on a canvas (first letter of
  `app_name` on the brand green `#16A34A`), rendered at 64×64 and served as a
  data URL
- **AND** the favicon href does not contain the configured `logo_url`

#### Scenario: Canvas unavailable

- **WHEN** the browser cannot provide a 2D canvas context
- **THEN** the bundled favicon stays in place
