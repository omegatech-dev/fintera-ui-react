## Purpose

Keep plan uploads limited to files the customer portal can render.

## ADDED Requirements

### Requirement: Accepted plan formats

The admin plan upload SHALL accept only `.svg`, `.png`, `.jpg`, `.jpeg` and
`.pdf` files, up to 50 MB each.

#### Scenario: Upload an SVG plan

- **WHEN** an admin selects an SVG file
- **THEN** the file passes client validation and is uploaded

#### Scenario: Upload a PNG or JPG plan

- **WHEN** an admin selects a PNG, JPG or JPEG file
- **THEN** the file passes client validation and is uploaded

#### Scenario: Upload a PDF plan

- **WHEN** an admin selects a PDF file
- **THEN** the file passes client validation and is uploaded

#### Scenario: Reject CAD files

- **WHEN** an admin selects a DWG or DXF file
- **THEN** the client rejects it as an unsupported type and sends nothing

#### Scenario: Size limit

- **WHEN** a plan file exceeds 50 MB
- **THEN** the client rejects it with the size error

### Requirement: Upload guidance

The plan upload panel SHALL describe the accepted formats.

#### Scenario: Read the hint

- **WHEN** an admin opens the project drawings panel
- **THEN** the hint lists SVG, PNG, JPG and PDF as the accepted plan formats
