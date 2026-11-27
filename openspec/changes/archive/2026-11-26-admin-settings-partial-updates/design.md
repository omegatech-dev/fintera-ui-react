## Context

`GeneralSettingsProvider.update()` currently sends the full settings snapshot
(`{ ...settings, ...partial }`) on every save, and `features/settings/api.js`
documents it as a deliberate workaround: the API replaces the singleton row,
so a partial request would erase the other sections.

The API is changing to merge per-field updates. The admin must then send only
the fields of the section being saved.

The admin cannot detect merge support from the response shape. The extended
policy fields in `GET /api/v1/settings` prove that the columns landed, not
that the handler merges; both can be deployed independently. A wrong guess
sends a partial payload to a replace-style handler and erases every other
section, which is unrecoverable data loss.

## Goals / Non-Goals

**Goals:**

- Send only the saved section's fields when the API can merge them.
- Keep today's behavior byte for byte when the API cannot merge them.
- Never write a destructive payload on a guess.

**Non-Goals:**

- Changing the API, its migration or its validation rules.
- Detecting merge support heuristically from the response shape.
- Retrying, repairing or reconciling a failed settings write.
- Migrating or rewriting existing settings values.

## Decisions

### Explicit capability flag

The API publishes `supports_partial_updates` in the settings response. The
admin reads it and decides:

- `true` -> `PUT` only the fields of the saved section.
- absent or `false` -> `PUT` the full snapshot, exactly as today.

The flag is read from the `GET` response and from every `PUT` response, so the
admin adapts without a redeploy when the API upgrades. The admin accepts the
flag either at the root of the payload or inside `settings` so it does not
depend on one exact response shape.

The API contract requires the flag to be `true` only when the handler really
merges provided fields. The flag and the merge must ship in the same binary:
a `true` flag with replace semantics would erase the other sections.

### No heuristic detection, no self-repair

An earlier draft inferred merge support from the presence of the extended
fields and repaired a detected wipe with a second write. Both were dropped:

- The inference is wrong: extended fields prove the columns landed, not that
  the handler merges.
- The repair does not fire in the real case: when the stored strings are
  already empty there is no non-empty value that turns empty, so a partial
  write resets the numeric policy values silently.
- The repair writes first and restores later, so the row is briefly wrong and
  a failed repair loses the values for good. A stale snapshot also overwrites
  concurrent edits, which is what partial updates exist to prevent.

The flag removes the need for both.

### The flag is not a setting

`supports_partial_updates` describes the API, not the deployment. It is
stripped before normalization so it never enters the settings snapshot, the
localStorage cache, or the payload of a full-snapshot update.

### Payment amounts use a shared numeric fallback

The minimum reservation amount is read as `Number(value) || 0` in the reserve
page and in the payment instructions page. `normalizeGeneralSettings` already
coerces numeric fields to a finite number with the configured default, so
this is robustness rather than a bug fix: `resolveSettingsNumber` documents
the intent, treats `null`, `undefined` and `""` as missing, and keeps an
explicit `0` (an admin disabling the minimum) intact.

### Currency labels come from the deployment

The reservation wizard labels hardcode `(HNL)` in both locales, so a
deployment configured with another currency shows the wrong unit. The wizard
already receives the resolved currency, so the labels interpolate it.

The bank account sheet keeps `HNL` as a selectable option; only its fallback
values (the empty form and the default prop) stop hardcoding the currency.

## Risks / Trade-offs

- **The flag is not implemented yet** -> the admin keeps sending the full
  snapshot and behaves exactly as today. The partial path stays inert.
- **A lying flag would erase settings** -> mitigated by the API contract: the
  flag must be `true` only when the handler merges. The admin never infers
  merge support on its own.
- **A partial update can still race with a concurrent admin** -> it no longer
  overwrites the other sections, which is the improvement this change buys.
- **The public settings response grows one field** -> the customer portal
  ignores unknown fields.

## Migration Plan

1. Ship the API with merge semantics and `supports_partial_updates`.
2. Ship this change. The admin starts sending partial payloads as soon as it
   sees the flag; no configuration and no redeploy of the admin are needed.
3. Rollback is safe: removing the flag from the API response returns the
   admin to full-snapshot updates on its next settings request.

## Open Questions

None. The exact flag placement in the API response is read leniently by the
admin and documented in `documentation/features/branding-settings.md`.
