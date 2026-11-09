## Context

See `proposal.md` for motivation. The previous workflow used a single Node
matrix entry, no concurrency control, no draft/docs filtering, and only ran for
PRs whose base was `main`. The repository is a JavaScript SPA with `npm` and
`package-lock.json`; `npm run verify` already chains lint, tests, and build.

## Goals / Non-Goals

**Goals:**

- Give fast feedback on every PR, including stacked PRs.
- Spend runner minutes only where they add signal.
- Keep the configuration small and dependency-free (no third-party actions
  beyond the official checkout/setup-node).

**Non-Goals:**

- Splitting lint/test/build into parallel jobs (each job would repeat `npm ci`,
  increasing cost faster than it reduces wall-clock time for a small suite).
- Adding deployment, release, or audit workflows.
- Changing application behavior.

## Decisions

### One job, three steps

Keeping lint, tests, and build in a single `verify` job means a single
`npm ci`, a single Node setup, and one runner for the whole run. For this
codebase the suite finishes in seconds, so parallelism would add cost without
meaningful speedup.

### Trigger on every base branch

Dropping the `branches: [main]` filter on `pull_request` makes stacked PRs run
CI with their real base. `push` remains limited to `main`.

### Concurrency and drafts

`concurrency` groups runs by PR number (or ref for pushes) and cancels
in-progress PR runs when a newer commit arrives. Draft PRs are skipped using a
job-level `if`; adding `ready_for_review` to the PR event types starts the first
full run when the PR becomes reviewable.

### Docs-only detection without third-party actions

A small shell step fetches the PR base commit and diffs the changed paths. If
every path is Markdown, `documentation/`, or `openspec/`, the workflow reports a
docs-only message and skips setup/install/lint/test/build. Detection is done
with `git` and `grep` locally, so there is no extra action and no API call.

The workflow still creates the `Verify` job for docs-only PRs, so required
status checks are reported instead of staying pending.

### Caching and install flags

`actions/setup-node@v5` caches npm downloads keyed on `package-lock.json`, and
`npm ci --prefer-offline --no-audit --no-fund` avoids unnecessary network and
audit work during install. Node comes from `.nvmrc`, keeping a single source of
truth.

## Risks / Trade-offs

- **Skipped docs-only checks** → The job still runs and reports a message, so
  branch protection sees a result; only the heavy steps are skipped.
- **Draft PRs show no checks** → Marking the PR ready for review triggers
  `ready_for_review` and starts the full run.
- **Shallow checkout cannot diff the base** → The detection step explicitly
  fetches the base SHA with `--depth=1` before diffing.
- **Timeouts hide slow regressions** → 15 minutes is far above the current
  runtime; it prevents runaway jobs rather than constraining normal runs.
