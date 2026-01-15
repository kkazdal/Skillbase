# Multi-stage build for production-ready NestJS application

# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production + dev for build)
# Using npm ci for faster, reliable, reproducible builds
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ============================================
# Stage 2: Runtime
# ============================================
FROM node:20-alpine AS runtime

# Install PostgreSQL client for database operations
RUN apk add --no-cache postgresql-client

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy SDK for testing (in development mode)
# Only copy SDK source and package.json, dependencies will be installed at runtime
COPY --from=builder /app/sdk/package*.json ./sdk/
COPY --from=builder /app/sdk/src ./sdk/src
COPY --from=builder /app/sdk/tests ./sdk/tests
COPY --from=builder /app/sdk/tsconfig.json ./sdk/

# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Change ownership of app directory
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port (can be overridden by environment variable)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use entrypoint script
ENTRYPOINT ["/app/docker-entrypoint.sh"]
