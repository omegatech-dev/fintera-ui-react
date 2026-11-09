---
description: Lint, test, and build FinteraUI before reporting completion.
agent: build
---

Verify the current working tree without changing behavior.

Run, in order, and stop to report on the first hard failure:

1. `npm run lint`
2. `npm run test:run`
3. `npm run build`
4. `git status --short` and `git diff --stat`

Do not commit. Summarize failures with the exact command and the relevant
output. Additional context: $ARGUMENTS
