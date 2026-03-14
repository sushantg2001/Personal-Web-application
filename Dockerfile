# ── Stage 1: Build ────────────────────────────────────────────────
FROM oven/bun:1 AS builder

WORKDIR /website

# Install dependencies (cached layer — only reruns if package.json changes)
COPY website/package.json website/bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy source and build
COPY website/ .
RUN bun run build

# ── Stage 2: Serve ────────────────────────────────────────────────
FROM nginx:alpine AS runner

# Copy built static files from builder stage
COPY --from=builder /website/out /usr/share/nginx/html

# Custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]