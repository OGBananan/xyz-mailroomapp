# Build context: monorepo root (so tsconfig.base.json is reachable)
# docker build -f nodejs/backend/Dockerfile -t xyz-mailroomapp-backend .

# ── Stage 1: compile ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Root tsconfig — backend's tsconfig.json extends this
COPY tsconfig.base.json ./

# Install deps (including devDeps — need tsc / ts-node for compilation)
COPY nodejs/backend/package*.json nodejs/backend/
RUN cd nodejs/backend && npm ci

# Source + tsconfig
COPY nodejs/backend/tsconfig.json nodejs/backend/
COPY nodejs/backend/src/           nodejs/backend/src/

# Compile TypeScript → dist/
RUN cd nodejs/backend && npm run build


# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Production deps only — no TypeScript, ts-node, tsx
COPY nodejs/backend/package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Compiled output from builder
COPY --from=builder /app/nodejs/backend/dist ./dist

EXPOSE 4000

# Liveness check — Railway uses this as the health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1

CMD ["node", "dist/main.js"]
