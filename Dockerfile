# syntax=docker/dockerfile:1

# ---- deps: install with Bun (uses the committed .npmrc for the private
#      @ckrowd GitHub registry) ----
FROM oven/bun:1.3.13 AS deps
WORKDIR /app
# NODE_AUTH_TOKEN must be set as a build arg in Dokploy (GitHub PAT with read:packages)
ARG NODE_AUTH_TOKEN
ENV NODE_AUTH_TOKEN=$NODE_AUTH_TOKEN
COPY package.json bun.lock .npmrc ./
RUN bun install --frozen-lockfile

# ---- builder: produce the Next.js standalone output ----
FROM oven/bun:1.3.13 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# API_URL is read by server actions; bake a default so the build never
# fails on a missing var. Override per-environment in Dokploy.
ARG API_URL=https://gateway.ckrowd.com
ENV API_URL=$API_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# ---- runner: minimal Node image serving the standalone bundle ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
# standalone bundles its own minimal node_modules + server.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
