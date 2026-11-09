## 1. Workflow

- [x] 1.1 Run CI on pull requests to any base branch (including stacked PRs), pushes to `main`, and manual dispatch; verify the `on` block lists `opened`, `synchronize`, `reopened`, and `ready_for_review`.
- [x] 1.2 Add `concurrency` keyed by PR number/ref with `cancel-in-progress` for PRs; verify two pushes to the same PR share a group.
- [x] 1.3 Skip draft PRs with a job-level `if`; verify `ready_for_review` is present so CI starts when the draft becomes reviewable.
- [x] 1.4 Add a docs-only detection step that diffs against the PR base SHA and sets `code=true|false`; verify the job still runs and reports a skip message for docs-only changes.
- [x] 1.5 Resolve Node from `.nvmrc`, enable npm caching with `cache-dependency-path: package-lock.json`, and install with `npm ci --no-audit --no-fund --prefer-offline`.
- [x] 1.6 Add `permissions: contents: read` and `timeout-minutes: 10`; verify the YAML parses with `npx yaml-lint`.
- [x] 1.7 Expand lint, test, and build into three parallel matrix jobs with `fail-fast: false`; verify each job runs its command and reports independently.

## 2. Documentation and validation

- [x] 2.1 Add a "Continuous integration" section to `documentation/guides/development.md` describing triggers, draft/docs skipping, caching, and cost choices.
- [x] 2.2 Create the OpenSpec change `fast-ci-pipeline` with `skip_specs: true`; verify `openspec validate --changes` passes.
- [x] 2.3 Run `npm run verify` locally; verify lint, tests, and build pass.
