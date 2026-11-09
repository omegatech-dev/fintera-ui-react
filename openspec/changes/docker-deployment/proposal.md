## Why

The UI is deployed as a Node process (`serve -s dist`), which requires runtime
Node and does not give control over SPA fallback, cache headers for the service
worker, or gzip. Railway can build and run a container, so a production
Dockerfile gives a small, reproducible runtime image with correct static-serving
behavior for the PWA.

## What Changes

- Add a multi-stage `Dockerfile`:
  - `node:26-alpine` builds `dist/` with `npm ci` and `npm run build`.
  - `nginx:alpine` serves the bundle.
- Add `.docker/nginx.conf.template` with SPA fallback, gzip, immutable caching
  for hashed assets, and no-cache headers for `index.html`, `sw.js`, and
  `manifest.webmanifest`.
- Listen on `$PORT` (default `8080`) so Railway and similar platforms can route
  traffic without code changes.
- Pass `VITE_*` values as build args because Vite embeds them at build time.
- Add `.dockerignore` to keep the build context small and avoid baking local
  `.env` files.
- Document local build/run and Railway build-arg configuration.

No application code, dependencies, or spec-level behavior changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This is deployment tooling only; `skip_specs: true` is set in
`.openspec.yaml`.

## Impact

- `Dockerfile`, `.dockerignore`, `.docker/nginx.conf.template`
- `README.md` and `documentation/guides/deployment.md`
- Existing Heroku/`serve` deployment path remains available.
