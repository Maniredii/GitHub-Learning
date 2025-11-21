# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/

# Install dependencies
RUN npm ci --workspace=backend --workspace=shared

# Copy source code
COPY backend ./backend
COPY shared ./shared
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build --workspace=backend
RUN npm run build --workspace=shared

# Production stage
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY --chown=nodejs:nodejs package*.json ./
COPY --chown=nodejs:nodejs backend/package*.json ./backend/
COPY --chown=nodejs:nodejs shared/package*.json ./shared/

# Install production dependencies only
RUN npm ci --workspace=backend --workspace=shared --omit=dev

# Copy built application
COPY --chown=nodejs:nodejs --from=builder /app/backend/dist ./backend/dist
COPY --chown=nodejs:nodejs --from=builder /app/shared/dist ./shared/dist
COPY --chown=nodejs:nodejs backend/knexfile.js ./backend/
COPY --chown=nodejs:nodejs backend/src/database ./backend/src/database

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "backend/dist/index.js"]
