# Deployment Guide

FinteraUI builds to a static bundle in `dist/` and is served as a SPA.

## Runtime

FinteraUI targets **Node.js 26 LTS**. The version is declared in `.nvmrc`,
`.node-version`, and `package.json` (`engines.node`).

- Heroku/npm-style platforms honor `engines.node`.
- Railway and other platforms that read `.node-version`/`.nvmrc` will use Node 26.
- CI uses Node 26.x.

## Build

```bash
npm run build
npm run preview   # local preview of the production build
```

## Serving

- `npm start` runs `serve -s dist` (single-page mode, falling back to
  `index.html` for client-side routes).
- `Procfile` declares `web: npm run start` for Heroku-style platforms.
- Railway deploys from the `main` branch (`npm run build`, then the static
  server).

## Environment variables

Set these in the hosting provider:

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Backend API base URL |
| `VITE_APP_ENV` | Recommended | Environment label |
| `VITE_ROLLBAR_ACCESS_TOKEN` | Optional | Enables Rollbar error reporting |
| `VITE_APP_VERSION` | Optional | Version reported to Rollbar |

Vite embeds `VITE_*` variables at build time, so rebuild after changing them.

## PWA

- `vite-plugin-pwa` generates the manifest and service worker.
- `registerType: "autoUpdate"` keeps installed clients current.
- GET API responses use a short-lived `NetworkFirst` cache to reduce repeated
  network traffic.
- `npm run generate-pwa-assets` regenerates icons from `public/logo.png`.

## Error monitoring

Rollbar is initialized in `src/main.jsx` only when
`VITE_ROLLBAR_ACCESS_TOKEN` is set. Uncaught errors and unhandled rejections are
reported in production.

## Post-deploy checks

- Load the app and sign in.
- Verify client-side routes deep-link correctly (SPA fallback).
- Confirm API requests target the configured `VITE_API_URL`.
- Check the service worker updates after a new deploy.
