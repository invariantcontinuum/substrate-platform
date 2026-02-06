#!/bin/bash
set -e

echo "🚀 Starting Nginx configuration..."

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Create required directories
mkdir -p /etc/nginx/conf.d
mkdir -p /var/log/nginx/metrics
mkdir -p /etc/nginx/ssl

# Set default values
ENABLE_HTTPS=${ENABLE_HTTPS:-false}
ENABLE_LOGGING=${ENABLE_LOGGING:-true}
ENABLE_METRICS=${ENABLE_METRICS:-true}
ENABLE_ACCESS_LOG=${ENABLE_ACCESS_LOG:-true}
ENABLE_ERROR_LOG=${ENABLE_ERROR_LOG:-true}
LOG_LEVEL=${LOG_LEVEL:-warn}
SERVER_NAME=${SERVER_NAME:-localhost}
HTTP_PORT=${HTTP_PORT:-80}
HTTPS_PORT=${HTTPS_PORT:-443}
METRICS_PORT=${METRICS_PORT:-9113}

log "Configuration:"
log "  ENABLE_HTTPS: $ENABLE_HTTPS"
log "  ENABLE_LOGGING: $ENABLE_LOGGING"
log "  ENABLE_METRICS: $ENABLE_METRICS"
log "  SERVER_NAME: $SERVER_NAME"
log "  HTTP_PORT: $HTTP_PORT"
log "  HTTPS_PORT: $HTTPS_PORT"
log "  METRICS_PORT: $METRICS_PORT"

# Configure logging
if [ "$ENABLE_LOGGING" = "true" ]; then
    log "✅ Logging enabled"
    
    if [ "$ENABLE_ACCESS_LOG" = "true" ]; then
        export ACCESS_LOG_CONFIG="access_log /var/log/nginx/access.log combined;"
        log "  - Access log: enabled"
    else
        export ACCESS_LOG_CONFIG="access_log off;"
        log "  - Access log: disabled"
    fi
    
    if [ "$ENABLE_ERROR_LOG" = "true" ]; then
        export ERROR_LOG_CONFIG="error_log /var/log/nginx/error.log $LOG_LEVEL;"
        log "  - Error log: enabled (level: $LOG_LEVEL)"
    else
        export ERROR_LOG_CONFIG="error_log /dev/null crit;"
        log "  - Error log: disabled"
    fi
else
    log "❌ Logging disabled"
    export ACCESS_LOG_CONFIG="access_log off;"
    export ERROR_LOG_CONFIG="error_log /dev/null crit;"
fi

# Export environment variables for envsubst
export ENABLE_HTTPS
export ENABLE_LOGGING
export ENABLE_METRICS
export ENABLE_ACCESS_LOG
export ENABLE_ERROR_LOG
export LOG_LEVEL
export SERVER_NAME
export HTTP_PORT
export HTTPS_PORT
export METRICS_PORT
export SSL_CERTIFICATE_PATH
export SSL_CERTIFICATE_KEY_PATH

# Process main nginx configuration
log "📝 Processing nginx.conf..."
envsubst '${ERROR_LOG_CONFIG} ${LOG_LEVEL}' \
    < /etc/nginx/templates/nginx.conf.template \
    > /etc/nginx/nginx.conf

# Configure HTTPS or HTTP
if [ "$ENABLE_HTTPS" = "true" ]; then
    log "🔒 HTTPS mode enabled"
    
    # Check if SSL certificates exist
    if [ ! -f "$SSL_CERTIFICATE_PATH" ] || [ ! -f "$SSL_CERTIFICATE_KEY_PATH" ]; then
        log "⚠️  SSL certificates not found. Generating self-signed certificate..."
        
        # Generate self-signed certificate
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout "$SSL_CERTIFICATE_KEY_PATH" \
            -out "$SSL_CERTIFICATE_PATH" \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=$SERVER_NAME"
        
        log "✅ Self-signed certificate generated"
    else
        log "✅ SSL certificates found"
    fi
    
    # Process SSL configuration
    log "📝 Processing SSL configuration..."
    envsubst '${SERVER_NAME} ${HTTP_PORT} ${HTTPS_PORT} ${SSL_CERTIFICATE_PATH} ${SSL_CERTIFICATE_KEY_PATH} ${ACCESS_LOG_CONFIG} ${ERROR_LOG_CONFIG}' \
        < /etc/nginx/templates/ssl.conf.template \
        > /etc/nginx/conf.d/default.conf
else
    log "🔓 HTTP mode enabled"
    
    # Process default HTTP configuration
    log "📝 Processing HTTP configuration..."
    envsubst '${SERVER_NAME} ${HTTP_PORT} ${ACCESS_LOG_CONFIG} ${ERROR_LOG_CONFIG}' \
        < /etc/nginx/templates/default.conf.template \
        > /etc/nginx/conf.d/default.conf
fi

# Configure metrics
if [ "$ENABLE_METRICS" = "true" ]; then
    log "📊 Metrics enabled on port $METRICS_PORT"
    
    # Process metrics configuration
    envsubst '${METRICS_PORT}' \
        < /etc/nginx/templates/metrics.conf.template \
        > /etc/nginx/conf.d/metrics.conf
else
    log "❌ Metrics disabled"
    # Remove metrics configuration if it exists
    rm -f /etc/nginx/conf.d/metrics.conf
fi

# Test nginx configuration
log "🧪 Testing nginx configuration..."
nginx -t

log "✅ Configuration complete!"
log "🚀 Starting nginx..."

# Execute the main command
exec "$@"
