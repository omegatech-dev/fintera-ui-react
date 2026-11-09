## Why

The CI workflow only runs for pull requests targeting `main`, so stacked PRs
never run checks. Every push also starts a new full run without cancelling the
previous one, draft PRs consume runner minutes before they are reviewable, and
docs-only changes still pay for lint, tests, and a production build. The result
is slower feedback and unnecessary cost.

## What Changes

- Run CI on pull requests to **any** base branch, plus pushes to `main` and
  `workflow_dispatch`.
- Cancel superseded runs for the same pull request.
- Skip CI for draft pull requests; start when they are marked ready for review.
- Detect docs-only changes and skip the heavy steps while still reporting a CI
  result.
- Cache npm downloads and install with `npm ci --prefer-offline --no-audit
  --no-fund`.
- Resolve Node from `.nvmrc` instead of a single-entry matrix.
- Add a 15-minute job timeout and read-only `contents` permission.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This is CI tooling only; no spec-level behavior changes. `skip_specs: true`
is set in `.openspec.yaml`.

## Impact

- `.github/workflows/ci.yml`
- `documentation/guides/development.md` (CI section)
- No application code, dependencies, or runtime behavior changes.
