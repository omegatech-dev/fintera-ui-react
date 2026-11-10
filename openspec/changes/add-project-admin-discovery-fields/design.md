## Context

Project create and edit are controlled forms with local state, a flat
`project: {...}` payload, and locale-backed labels. The list card reads the admin
project response. FinteraAPI is adding nullable `city` and `code` columns; this
change makes them manageable from the admin UI.

See `proposal.md` and
`openspec/changes/add-project-admin-discovery-fields/specs/project-management/spec.md`.

## Goals / Non-Goals

**Goals:**

- Let admins set city and code when creating or editing a project.
- Show both values in the project list.
- Keep the fields optional and backwards compatible.

**Non-Goals:**

- Changing the project import format.
- Validating city against a fixed catalog (free text is intentional for now).
- Public portal rendering; that lives in FinteraWeb's
  `enhance-project-directory`.

## Decisions

### Free-text `city`, short `code`

`city` is free text (max 120 characters at the API layer) because Fintera does
not maintain a city catalog yet. `code` is a short human-readable identifier
(max 40 characters) and is not required to be unique; the GUID remains the
canonical identifier.

### Optional fields

Both inputs are optional. Empty values are sent as `null` so an admin can clear
them. The edit form pre-fills from `pdata.city` / `pdata.code` and the create
form starts empty.

### Card display

The list card shows `city` when present and falls back to the first address
segment. The code is rendered as a small monospace chip next to the GUID, which
is already displayed on the card. Empty values render nothing.

### Locale coverage

New labels go through `useLocale` so both `es.json` and `en.json` stay in sync
with the rest of the project screens.

## Risks / Trade-offs

- **Unvalidated city text** → duplicates like "SPS" and "San Pedro Sula" can
  appear. Acceptable for now; a catalog can be added later without changing the
  payload.
- **API not deployed yet** → the fields are simply omitted/null; the UI does not
  crash and the rest of the form keeps working.
- **Rollback** → remove the inputs and payload keys; no data migration needed
  because the columns are nullable.
