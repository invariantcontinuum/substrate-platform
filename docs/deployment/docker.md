# Docker Deployment Guide

This guide explains how to containerize and run the Substrate Platform using Docker with configurable Nginx settings.

## 📋 Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Deployment Modes](#deployment-modes)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Monitoring](#monitoring)
- [Environment Variables](#environment-variables)
- [Building and Running](#building-and-running)

## ✨ Features

- **🔒 Flexible HTTPS/HTTP**: Switch between HTTPS and HTTP modes using environment variables
- **📊 Built-in Metrics**: Nginx metrics endpoint for Prometheus monitoring
- **📝 Configurable Logging**: Enable/disable access and error logs
- **🚀 Multi-stage Build**: Optimized Docker image with build and production stages
- **🔐 Security Headers**: Modern security headers included by default
- **⚡ Performance**: Gzip compression, caching, and optimized Nginx settings
- **🏥 Health Checks**: Built-in health check endpoints

## 🚀 Quick Start

### HTTP Mode (Default)
```bash
# Build and run with HTTP
docker compose --profile http up -d

# Access the application
open http://localhost:8080
```

### HTTPS Mode
```bash
# Build and run with HTTPS
docker compose --profile https up -d

# Access the application
open https://localhost
```

### Minimal Mode (No Logging/Metrics)
```bash
# Build and run minimal setup
docker compose --profile minimal up -d
```

## ⚙️ Configuration

### Environment Variables

The application can be configured using the following environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `ENABLE_HTTPS` | `false` | Enable HTTPS mode and HTTP to HTTPS redirect |
| `ENABLE_LOGGING` | `true` | Enable nginx logging |
| `ENABLE_METRICS` | `true` | Enable metrics endpoint |
| `ENABLE_ACCESS_LOG` | `true` | Enable access log (requires `ENABLE_LOGGING=true`) |
| `ENABLE_ERROR_LOG` | `true` | Enable error log (requires `ENABLE_LOGGING=true`) |
| `LOG_LEVEL` | `warn` | Log level: `debug`, `info`, `notice`, `warn`, `error`, `crit` |
| `SERVER_NAME` | `localhost` | Server name for nginx |
| `HTTP_PORT` | `80` | HTTP port inside container |
| `HTTPS_PORT` | `443` | HTTPS port inside container |
| `METRICS_PORT` | `9113` | Metrics endpoint port |
| `SSL_CERTIFICATE_PATH` | `/etc/nginx/ssl/cert.pem` | Path to SSL certificate |
| `SSL_CERTIFICATE_KEY_PATH` | `/etc/nginx/ssl/key.pem` | Path to SSL private key |

## 🎯 Deployment Modes

### 1. Development (HTTP)
Perfect for local development without SSL complexity:

```bash
docker run -d \
  -p 8080:80 \
  -p 9113:9113 \
  -e ENABLE_HTTPS=false \
  -e ENABLE_LOGGING=true \
  -e ENABLE_METRICS=true \
  -e LOG_LEVEL=info \
  --name substrate-platform \
  substrate-platform:latest
```

### 2. Production (HTTPS)
For production with SSL certificates:

```bash
docker run -d \
  -p 80:80 \
  -p 443:443 \
  -p 9113:9113 \
  -e ENABLE_HTTPS=true \
  -e ENABLE_LOGGING=true \
  -e ENABLE_METRICS=true \
  -e LOG_LEVEL=warn \
  -e SERVER_NAME=yourdomain.com \
  -v $(pwd)/ssl:/etc/nginx/ssl:ro \
  -v $(pwd)/logs:/var/log/nginx \
  --name substrate-platform \
  substrate-platform:latest
```

### 3. Minimal (No Logging/Metrics)
Lightweight setup for resource-constrained environments:

```bash
docker run -d \
  -p 8080:80 \
  -e ENABLE_HTTPS=false \
  -e ENABLE_LOGGING=false \
  -e ENABLE_METRICS=false \
  --name substrate-platform \
  substrate-platform:latest
```

## 🔐 SSL/HTTPS Setup

### Option 1: Self-Signed Certificate (Auto-generated)

If no SSL certificates are provided, the entrypoint script will automatically generate a self-signed certificate:

```bash
docker compose --profile https up -d
```

### Option 2: Provide Your Own Certificates

1. Create an `ssl` directory:
```bash
mkdir -p ssl
```

2. Place your certificates:
```bash
cp your-certificate.crt ssl/cert.pem
cp your-private-key.key ssl/key.pem
```

3. Run with certificate volume:
```bash
docker compose --profile https up -d
```

### Option 3: Let's Encrypt with Certbot

1. Generate certificates using Certbot:
```bash
certbot certonly --standalone -d yourdomain.com
```

2. Mount the Let's Encrypt directory:
```bash
docker run -d \
  -p 80:80 \
  -p 443:443 \
  -e ENABLE_HTTPS=true \
  -e SERVER_NAME=yourdomain.com \
  -e SSL_CERTIFICATE_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem \
  -e SSL_CERTIFICATE_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  substrate-platform:latest
```

## 📊 Monitoring

### Accessing Metrics

With `ENABLE_METRICS=true`, the following endpoints are available:

- **Nginx stub_status**: `http://localhost:9113/metrics`
- **Stats endpoint**: `http://localhost:9113/stats`
- **Extended status**: `http://localhost:9113/nginx_status`

### Prometheus Integration

Start the full monitoring stack:

```bash
docker compose --profile http --profile monitoring up -d
```

This starts:
- **Substrate Platform** on port 8080
- **Prometheus** on port 9090
- **Nginx Exporter** on port 9114
- **Grafana** on port 3000

Access Grafana at `http://localhost:3000` (default credentials: `admin/admin`)

### Viewing Logs

With `ENABLE_LOGGING=true`, logs are stored in `/var/log/nginx`:

```bash
# View access logs
docker exec substrate-platform tail -f /var/log/nginx/access.log

# View error logs
docker exec substrate-platform tail -f /var/log/nginx/error.log

# Or mount logs volume for host access
docker compose --profile http up -d
tail -f logs/access.log
```

## 🏗️ Building and Running

### Build the Docker Image

```bash
docker build -t substrate-platform:latest .
```

### Run with Docker

```bash
# HTTP mode
docker run -d -p 8080:80 substrate-platform:latest

# HTTPS mode with custom settings
docker run -d \
  -p 80:80 \
  -p 443:443 \
  -e ENABLE_HTTPS=true \
  -e LOG_LEVEL=info \
  substrate-platform:latest
```

### Run with Docker Compose

```bash
# HTTP mode
docker compose --profile http up -d

# HTTPS mode
docker compose --profile https up -d

# With monitoring
docker compose --profile http --profile monitoring up -d

# Stop services
docker compose --profile http down
```

## 🔧 Advanced Configuration

### Custom Nginx Configuration

If you need to customize nginx configuration beyond environment variables:

1. Create custom templates in `docker/nginx/`
2. Mount them at runtime:
```bash
docker run -d \
  -v $(pwd)/custom-nginx.conf:/etc/nginx/templates/nginx.conf.template \
  substrate-platform:latest
```

### Health Checks

The application includes a built-in health check endpoint:

```bash
curl http://localhost:8080/health
# Response: healthy
```

Docker health check is configured automatically:
```bash
docker ps
# STATUS should show "healthy" after a few seconds
```

## 📝 Examples

### Complete Production Setup

```bash
# Create necessary directories
mkdir -p ssl logs

# Place your SSL certificates
cp /path/to/cert.pem ssl/
cp /path/to/key.pem ssl/

# Create custom environment file
cat > .env.production << EOF
ENABLE_HTTPS=true
ENABLE_LOGGING=true
ENABLE_METRICS=true
LOG_LEVEL=warn
SERVER_NAME=myapp.example.com
EOF

# Run with production settings
docker run -d \
  -p 80:80 \
  -p 443:443 \
  -p 9113:9113 \
  --env-file .env.production \
  -v $(pwd)/ssl:/etc/nginx/ssl:ro \
  -v $(pwd)/logs:/var/log/nginx \
  --restart unless-stopped \
  --name substrate-platform-prod \
  substrate-platform:latest
```

### Development with Hot Reload (Source Mounted)

For development with source code changes:

```bash
# Build development image
docker build --target builder -t substrate-platform:dev .

# Run with source mounted
docker run -d \
  -p 8080:80 \
  -v $(pwd)/src:/app/src \
  -e ENABLE_HTTPS=false \
  -e LOG_LEVEL=debug \
  substrate-platform:dev
```

## 🐛 Troubleshooting

### Check Container Logs
```bash
docker logs substrate-platform
```

### Test Nginx Configuration
```bash
docker exec substrate-platform nginx -t
```

### Restart Container
```bash
docker restart substrate-platform
```

### Check Metrics
```bash
curl http://localhost:9113/metrics
```

### Verify SSL Certificate
```bash
docker exec substrate-platform-https openssl x509 -in /etc/nginx/ssl/cert.pem -text -noout
```

## 📦 Image Optimization

The Docker image uses multi-stage builds for optimal size:

- **Builder stage**: Compiles and builds the application
- **Production stage**: Only includes nginx and built assets
- **Final size**: ~50-60MB (nginx:alpine + app)

Check image size:
```bash
docker images substrate-platform
```

## 🔄 Updates and Maintenance

### Rebuild Image
```bash
docker compose build --no-cache
```

### Update Running Container
```bash
docker compose pull
docker compose up -d
```

### Clean Up
```bash
# Remove containers
docker compose down

# Remove volumes
docker compose down -v

# Remove images
docker rmi substrate-platform:latest
```

## 📚 Additional Resources

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Prometheus Monitoring](https://prometheus.io/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

## 🤝 Support

For issues or questions, please check the container logs first:
```bash
docker logs substrate-platform -f
```
