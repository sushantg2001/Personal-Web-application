# Dockerfile
#
# Build context is the repo root. .dockerignore keeps node_modules, build
# output, the design-system mockups and scripts/ out of it — the context should
# be a few hundred KB, not the whole checkout.

# ── Stage 1: Build ────────────────────────────────────────────────
FROM oven/bun:1 AS builder

WORKDIR /website

# Install dependencies (cached layer — only reruns if the manifest or lockfile changes)
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy source and build
COPY . .
RUN bun run build

# ── Stage 2: Serve ────────────────────────────────────────────────
FROM nginx:alpine AS runner

# Upgrade OS packages to pull in Alpine security fixes the base image lags on
# (e.g. c-ares, libexpat HIGH CVEs). Keeps the Trivy image scan gate green.
RUN apk update && apk upgrade --no-cache

# Copy built static files from builder stage
COPY --from=builder /website/out /usr/share/nginx/html

# Custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]