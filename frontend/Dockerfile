# Build stage
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (need all deps for build; --only=production would skip devDependencies)
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Install openssl for self-signed certificate generation in entrypoint
RUN apk add --no-cache openssl

# Copy built app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration and entrypoint
COPY nginx.conf /etc/nginx/nginx.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Create SSL directory (entrypoint may write self-signed cert here if none mounted)
RUN mkdir -p /etc/nginx/ssl

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

# Generate self-signed cert if none provided, then start nginx
ENTRYPOINT ["/docker-entrypoint.sh"] 