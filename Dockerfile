# =============================================================================
# acne-web - Portal del dermatologo y PWA del paciente (Next.js 14)
# =============================================================================

FROM node:20-bookworm-slim AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml* .npmrc* ./
RUN pnpm install --frozen-lockfile=false

FROM node:20-bookworm-slim AS build
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Baked into the client bundle, so it must be known at build time.
# Left EMPTY by default: src/lib/api.ts then calls http://<host the page was opened from>:3001/api,
# which is what makes the phone capture work over the LAN. A literal `localhost` here would make
# the phone that scans the QR call itself.
ARG NEXT_PUBLIC_API_URL=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/.npmrc* ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.mjs ./next.config.mjs

RUN useradd --create-home --uid 10001 acne && chown -R acne:acne /app
USER acne

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"

# next directly, not `pnpm start`: corepack would try to download pnpm at runtime as user acne.
CMD ["node_modules/.bin/next", "start", "-p", "3000", "-H", "0.0.0.0"]
