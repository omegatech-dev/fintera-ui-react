## 1. Image

- [x] 1.1 Add a multi-stage `Dockerfile` using `node:26-alpine` for `npm ci` + `npm run build` and `nginx:alpine` for the runtime; verify `docker build` succeeds.
- [x] 1.2 Declare `VITE_API_URL`, `VITE_APP_ENV`, `VITE_ROLLBAR_ACCESS_TOKEN`, and `VITE_APP_VERSION` as build args; verify a build with `--build-arg VITE_API_URL=...` embeds the value in `dist/`.
- [x] 1.3 Default `PORT` to `8080` and expose it; verify the container starts without `PORT` and responds on `8080`.
- [x] 1.4 Add a healthcheck against `http://127.0.0.1:${PORT}/`; verify the container reports `healthy`.

## 2. Static serving

- [x] 2.1 Add `.docker/nginx.conf.template` with `listen ${PORT}`, gzip, SPA fallback (`try_files $uri $uri/ /index.html`), immutable caching for hashed assets, and `no-cache` for `index.html`, `sw.js`, and `manifest.webmanifest`; verify `nginx -t` passes inside the image.
- [x] 2.2 Add `.dockerignore` excluding `node_modules`, `dist`, tests, docs, and `.env*`; verify the build context size drops.

## 3. Documentation and validation

- [x] 3.1 Document local `docker build`/`docker run`, Railway `PORT`, and build-arg configuration in `README.md` and `documentation/guides/deployment.md`.
- [x] 3.2 Add the `docker-deployment` OpenSpec change with `skip_specs: true`; verify `openspec validate --changes` passes.
- [x] 3.3 Run `npm run verify`; verify lint, tests, and build pass.
