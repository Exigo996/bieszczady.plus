# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build the application (generates .output directory)
# With ssr: false, this creates a static SPA with Nitro server
RUN npm run build

# Production stage - use Nitro server
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy built files from builder (the .output directory contains the Nitro server)
COPY --from=builder /app/.output ./

# Expose port
EXPOSE 3000

# Start the Nitro server
# Nitro automatically listens on PORT env var
CMD ["node", "server/index.mjs"]
