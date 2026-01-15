FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN npm install -g npm@11.6.2

FROM base AS builder

# Set working directory
WORKDIR /app
# Install turbo and other global deps
RUN npm install -g turbo
COPY . .
# Prune the workspace to only include the "worker" app
RUN turbo prune --scope=worker --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer

WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Generate Prisma Client
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx turbo run db:generate

RUN npx turbo run build --filter=worker...

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 workeruser
USER workeruser

COPY --from=installer --chown=workeruser:nodejs /app .

CMD node apps/worker/dist/index.js
