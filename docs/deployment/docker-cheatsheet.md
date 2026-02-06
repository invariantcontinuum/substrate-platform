# 🐳 Docker Quick Reference

## Quick Start Commands

```bash
# HTTP Mode (Development)
docker compose --profile http up -d

# HTTPS Mode (Production)
docker compose --profile https up -d

# With Monitoring
docker compose --profile monitoring up -d
```

## Essential Commands

| Command | Description |
|---------|-------------|
| `docker build -t substrate-platform:latest .` | Build the Docker image |
| `docker compose --profile http up -d` | Start in HTTP mode |
| `docker compose --profile https up -d` | Start in HTTPS mode |
| `docker compose --profile http --profile monitoring up -d` | Start with Prometheus + Grafana |
| `docker compose down` | Stop all containers |
| `docker compose logs -f` | View logs |
| `curl http://localhost:9113/metrics` | Show nginx metrics |
| `curl http://localhost:8080/health` | Test HTTP endpoint |

## Access URLs

### HTTP Mode
- **Application**: http://localhost:8080
- **Health Check**: http://localhost:8080/health
- **Metrics**: http://localhost:9113/metrics

### HTTPS Mode
- **Application**: https://localhost
- **Health Check**: https://localhost/health
- **Metrics**: http://localhost:9113/metrics

### Monitoring Stack
- **Application**: http://localhost:8080
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)
- **Nginx Exporter**: http://localhost:9114/metrics

## Environment Variables

### Core Settings
```bash
ENABLE_HTTPS=false          # Enable HTTPS (true/false)
ENABLE_LOGGING=true         # Enable logging (true/false)
ENABLE_METRICS=true         # Enable metrics (true/false)
LOG_LEVEL=warn             # Log level
SERVER_NAME=localhost       # Domain name
```

### Quick Configurations

**Development**
```bash
ENABLE_HTTPS=false
ENABLE_LOGGING=true
ENABLE_METRICS=true
LOG_LEVEL=info
```

**Production**
```bash
ENABLE_HTTPS=true
ENABLE_LOGGING=true
ENABLE_METRICS=true
LOG_LEVEL=warn
SERVER_NAME=yourdomain.com
```

**Minimal**
```bash
ENABLE_HTTPS=false
ENABLE_LOGGING=false
ENABLE_METRICS=false
```

## Common Tasks

### View Logs
```bash
# All logs
docker compose logs -f

# Specific container logs
docker logs -f substrate-platform
```

### Check Status
```bash
# Container status
docker compose ps

# Health check
curl http://localhost:8080/health

# Nginx configuration test
docker exec substrate-platform nginx -t
```

### SSL Setup
```bash
# Generate self-signed certificate
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Or place your certificates
mkdir -p ssl
cp your-cert.pem ssl/cert.pem
cp your-key.pem ssl/key.pem
```

### Debugging
```bash
# Open shell
docker exec -it substrate-platform /bin/sh

# Check nginx config
docker exec substrate-platform nginx -t

# View real-time logs
docker logs -f substrate-platform

# Check metrics
curl http://localhost:9113/metrics
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Change ports in docker-compose.yml |
| SSL certificate error | Generate certs manually or provide valid certs |
| Container won't start | Check logs with `docker logs substrate-platform` |
| 502 Bad Gateway | Check if build completed: `docker compose logs` |
| Can't access metrics | Ensure `ENABLE_METRICS=true` |

## File Structure

```
substrate-platform/
├── Dockerfile                          # Multi-stage build configuration
├── docker-compose.yml                  # Orchestration configuration
├── docs/deployment/docker.md           # Full documentation
├── .dockerignore                      # Build optimization
├── .env.docker.example                # Environment template
└── docker/
    ├── entrypoint.sh                  # Dynamic configuration script
    ├── nginx/
    │   ├── nginx.conf.template       # Main nginx config
    │   ├── default.conf.template     # HTTP config
    │   ├── ssl.conf.template         # HTTPS config
    │   └── metrics.conf.template     # Metrics config
    ├── prometheus/
    │   └── prometheus.yml            # Prometheus config
    └── grafana/
        ├── datasources/
        │   └── prometheus.yml        # Grafana datasource
        └── dashboards/
            └── dashboard.yml         # Dashboard provider
```

## Next Steps

1. **Development**: `docker compose --profile http up -d`
2. **Production**: Generate/provide SSL certs, then `docker compose --profile https up -d`
3. **Monitoring**: `docker compose --profile monitoring up -d`
4. **Customize**: Edit templates in `docker/nginx/`
5. **Read More**: See `docker.md` in the deployment docs for detailed documentation
