---
description: Sync documentation and OpenSpec specs with working-tree changes.
agent: build
---

Synchronize documentation and specs with the working tree changes.

1. Inspect `git status` and `git diff` to identify changed files.
2. Map changes to docs:
   - routes, guards, API client, auth -> `documentation/architecture/api-and-auth.md`
   - feature modules, domain flows -> `documentation/architecture/overview.md` and `documentation/features/`
   - i18n, contexts -> `documentation/architecture/i18n.md`
   - scripts, config, tooling -> `documentation/guides/development.md`
   - tests -> `documentation/guides/testing.md`
   - deploy, PWA, env -> `documentation/guides/deployment.md`
3. Update `openspec/specs/<capability>/spec.md` when observable behavior
   changes. Ask when it is unclear whether behavior changed.
4. Update `AGENTS.md` only if commands, conventions, or guardrails changed.
5. Verify markdown links still resolve.
6. Run `npm run verify`. Do not commit. Report which docs and specs changed.

Context: $ARGUMENTS
