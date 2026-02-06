FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install envsubst and bash for entrypoint script
RUN apk add --no-cache bash gettext

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/*

# Create necessary directories
RUN mkdir -p /etc/nginx/ssl \
    /var/log/nginx/metrics \
    /var/cache/nginx \
    /var/run/nginx

# Copy custom nginx configuration templates
COPY docker/nginx/nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY docker/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY docker/nginx/ssl.conf.template /etc/nginx/templates/ssl.conf.template
COPY docker/nginx/metrics.conf.template /etc/nginx/templates/metrics.conf.template

# Copy entrypoint script
COPY ./docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy built application from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /etc/nginx/ssl

# Environment variables with defaults
ENV ENABLE_HTTPS=false \
    ENABLE_LOGGING=true \
    ENABLE_METRICS=true \
    ENABLE_ACCESS_LOG=true \
    ENABLE_ERROR_LOG=true \
    LOG_LEVEL=warn \
    SSL_CERTIFICATE_PATH=/etc/nginx/ssl/cert.pem \
    SSL_CERTIFICATE_KEY_PATH=/etc/nginx/ssl/key.pem \
    SERVER_NAME=localhost \
    HTTP_PORT=80 \
    HTTPS_PORT=443 \
    METRICS_PORT=9113

# Expose ports
EXPOSE 80 443 9113

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Default command
CMD ["nginx", "-g", "daemon off;"]
