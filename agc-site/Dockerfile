# Africa Governance Centre - Production Dockerfile
# Optimized for Coolify deployment

FROM node:20-alpine AS base
# Prisma engines need OpenSSL on Alpine (runtime + build)
RUN apk add --no-cache libc6-compat openssl

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# postinstall runs prisma generate — schema not copied yet; generate happens in builder after COPY . .
RUN npm ci --ignore-scripts

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Generate client after full tree (schema not available during deps npm ci)
RUN npx prisma generate
# No DB in build context; content layer returns fallbacks (see src/lib/content.ts)
RUN BUILD_WITHOUT_DB=1 npm run build

# Production image, copy all the files and run next
FROM base AS runner
RUN apk add --no-cache wget
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
# JSON metadata for media IDs (media-…); mount a volume here in production so uploads + library stay in sync.
COPY --from=builder --chown=nextjs:nodejs /app/data ./data
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
