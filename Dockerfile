# syntax=docker/dockerfile:1

# ---- Build the static bundle ----
FROM node:26-alpine AS build
WORKDIR /app

# Install dependencies first so Docker can cache this layer.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# Vite inlines VITE_* values at build time. Pass them as build args.
ARG VITE_API_URL
ARG VITE_APP_ENV=production
# Rollbar's browser access token is public by design (it ships in the bundle),
# so BuildKit's secret-in-ARG warning is expected here.
ARG VITE_ROLLBAR_ACCESS_TOKEN
ARG VITE_ROLLBAR_ENVIRONMENT
ARG VITE_APP_VERSION
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_APP_ENV=${VITE_APP_ENV} \
    VITE_ROLLBAR_ACCESS_TOKEN=${VITE_ROLLBAR_ACCESS_TOKEN} \
    VITE_ROLLBAR_ENVIRONMENT=${VITE_ROLLBAR_ENVIRONMENT} \
    VITE_APP_VERSION=${VITE_APP_VERSION}

RUN npm run build

# ---- Serve the bundle ----
FROM nginx:alpine AS runtime

# Railway (and most PaaS) inject PORT. 8080 is the local default.
ENV PORT=8080

COPY .docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider "http://127.0.0.1:${PORT}/" || exit 1
