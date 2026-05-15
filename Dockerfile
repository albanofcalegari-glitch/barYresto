FROM node:20-alpine AS base

# --- Dependencies ---
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- Builder ---
FROM base AS builder
RUN apk add --no-cache openssl
WORKDIR /app
RUN corepack enable pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Dummy env vars for build-time validation (overridden at runtime)
ENV DATABASE_URL="postgresql://x:x@localhost:5432/x"
ENV AUTH_SECRET="build-time-placeholder-min16chars"
ENV AUTH_URL="http://localhost:3000"

RUN npx prisma generate
RUN pnpm build

# --- Runner ---
FROM base AS runner
RUN apk add --no-cache openssl vips-dev
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.pnpm/@prisma+client*/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/.pnpm/sharp*/node_modules/sharp ./node_modules/sharp

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
