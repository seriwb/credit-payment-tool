FROM node:25-alpine AS base
RUN corepack enable

FROM base AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY packages/db/package.json ./packages/db/
COPY apps/web/package.json ./apps/web/

RUN yarn workspaces focus web

RUN mkdir -p ./apps/web/node_modules


FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/.yarn ./.yarn
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules

# TODO: public env

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN npm install -g --os=linux --cpu=x64 sharp
RUN yarn web:build


FROM base AS runner
RUN apk add --no-cache curl
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /usr/local/lib/node_modules /usr/local/lib/node_modules

ENV NEXT_SHARP_PATH=/usr/local/lib/node_modules/sharp

USER nextjs

HEALTHCHECK --interval=30s --timeout=15s CMD curl -f http://localhost:3000/api/healthcheck || exit 1

EXPOSE 3000
ENV PORT=3000

CMD ["node", "apps/web/server.js"]