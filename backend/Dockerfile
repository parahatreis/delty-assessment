# Multi-stage build for optimized production image

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Enable Corepack for Yarn 3.6.4
RUN corepack enable

# Copy package files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Install dependencies
RUN yarn install --immutable

# Copy tsconfig, drizzle config and source code
COPY tsconfig.json ./
COPY drizzle.config.ts ./
COPY src ./src

# Generate migrations
RUN yarn db:generate

# Build TypeScript to JavaScript
RUN yarn build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Enable Corepack for Yarn 3.6.4
RUN corepack enable

# Copy package files and install ALL dependencies (need drizzle-kit for migrations)
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

RUN yarn install --immutable && \
    yarn cache clean

# Copy built application, migrations, and config from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

# Copy startup script
COPY start-prod.sh ./start-prod.sh
RUN chmod +x ./start-prod.sh

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port (App Runner uses 8080 by default)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=20s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application via startup script
CMD ["./start-prod.sh"]
