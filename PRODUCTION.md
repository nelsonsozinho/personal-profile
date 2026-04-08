# Production Deployment Guide

## Overview

This is an Angular 21 SSR (Server-Side Rendering) application optimized for production deployment. This guide covers setup, building, and running the application in production environments.

## System Requirements

- Node.js 22+ (required for ESM support and performance)
- npm 11.9.0+
- Linux/Unix environment recommended for production (Docker container provided)

## Security Updates

### Critical Security Patch Applied
- **CVE-2026-32635**: XSS vulnerability in i18n attribute bindings
- **Status**: ✅ Fixed (Angular 21.2.4+)
- **Impact**: Prevents cross-site scripting attacks via internationalized attributes

## Installation

```bash
# Install dependencies
npm install

# Environment Setup
cp .env.example .env
# Edit .env with your production configuration
```

## Environment Variables

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `NODE_ENV` | `development` | Yes | Set to `production` for production deployments |
| `PORT` | `4000` | No | Server port for the SSR application |
| `API_URL` | - | No | Backend API URL for your application |

## Building for Production

### Standard Production Build

```bash
# Build optimized SSR bundle (production mode)
npm run build:prod

# The output will be in dist/personal-profile/
```

### Docker Build (Recommended)

```bash
# Build Docker image
docker build -t personal-profile:latest .

# Run container
docker run -p 4000:4000 -e NODE_ENV=production personal-profile:latest

# With environment variables
docker run \
  -p 4000:4000 \
  -e NODE_ENV=production \
  -e API_URL=https://api.example.com \
  personal-profile:latest
```

## Running in Production

### Node.js (Direct)

```bash
# Set environment
export NODE_ENV=production
export PORT=4000

# Build
npm run build:prod

# Start server
npm run serve:ssr:personal-profile
```

### PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start "npm run serve:ssr:personal-profile" --name personal-profile

# Configure startup
pm2 startup
pm2 save

# Monitor
pm2 monit
```

### Docker Compose Example

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  personal-profile:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '4000:4000'
    environment:
      NODE_ENV: production
      PORT: 4000
      API_URL: https://api.example.com
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:4000/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

Run with: `docker-compose up -d`

## Health Checks

The application provides a health check endpoint for monitoring and orchestration:

```bash
curl http://localhost:4000/health
```

Response (200 OK):

```json
{
  "status": "ok",
  "timestamp": "2026-04-08T12:34:56.789Z",
  "environment": "production",
  "uptime": 1234.56
}
```

## Performance Features

### Security Headers
- **HSTS**: HTTP Strict Transport Security enabled (1 year max-age)
- **CSP**: Content Security Policy configured
- **Frame Guard**: X-Frame-Options set to DENY
- **XSS Protection**: Enabled

### Caching Strategy
- Static assets cached for 1 year with versioning
- ETag disabled for consistent cache behavior
- Gzip compression enabled for all responses
- Compression ratio: typically 50-70% reduction

### SSR Optimizations
- 30-second render timeout to prevent hanging requests
- Graceful fallback on SSR errors
- Pre-rendered routes for fast initial load
- Client hydration with event replay

## Monitoring & Logging

### Console Logs (Structured)

The application provides structured logging:

```
[2026-04-08T12:34:56.789Z] GET /api/data
[production] Node Express server listening on http://0.0.0.0:4000
[production] Health check available at http://0.0.0.0:4000/health
```

### Integration with External Logging

For production, consider integrating with:
- **CloudWatch** (AWS)
- **Datadog**
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Splunk**
- **New Relic**

Example integration point: Update `src/server.ts` to send logs to your service.

## Testing Before Deployment

### Run Tests

```bash
# Unit tests
npm test

# Build verification
npm run build:prod

# Local SSR testing
npm run serve:ssr:personal-profile
# Visit http://localhost:4000
```

## Production Checklist

- [ ] Environment variables configured (.env)
- [ ] NODE_ENV=production
- [ ] API_URL set correctly
- [ ] Build completed successfully (`npm run build:prod`)
- [ ] Health check endpoint responding (GET /health)
- [ ] SSL/TLS configured on reverse proxy (nginx, CloudFront, etc.)
- [ ] Security headers verified via curl or browser dev tools
- [ ] Monitoring/logging configured
- [ ] Backup/disaster recovery plan in place
- [ ] Load balancer health check configured to `/health` endpoint

## Deployment Strategies

### Blue-Green Deployment

```bash
# Build new version
docker build -t personal-profile:v2 .

# Run new version on different port
docker run -p 4001:4000 personal-profile:v2

# Test new version
curl http://localhost:4001

# Switch traffic (via reverse proxy or load balancer)
# Then stop old container
docker stop personal-profile-v1
```

### Kubernetes Example

Create `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: personal-profile
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
  selector:
    matchLabels:
      app: personal-profile
  template:
    metadata:
      labels:
        app: personal-profile
    spec:
      containers:
        - name: personal-profile
          image: personal-profile:latest
          ports:
            - containerPort: 4000
          env:
            - name: NODE_ENV
              value: 'production'
            - name: API_URL
              value: 'https://api.example.com'
          livenessProbe:
            httpGet:
              path: /health
              port: 4000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 4000
            initialDelaySeconds: 5
            periodSeconds: 5
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
```

Deploy: `kubectl apply -f k8s-deployment.yaml`

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 4000
lsof -i :4000

# Kill process
kill -9 <PID>
```

### SSR Rendering Timeout

Check application logs for infinite loops or blocking operations in components.

### High Memory Usage

- Monitor with `ps aux | grep node`
- Consider adding memory limits in container/process manager
- Check for memory leaks in component lifecycle

### Health Check Failing

Verify the application is running:

```bash
curl -v http://localhost:4000/health
```

## Performance Benchmarks

Typical production metrics:

- **Time to First Byte (TTFB)**: 50-200ms (SSR)
- **Bundle Size**: ~400-500KB gzipped
- **Memory Usage**: 100-150MB per instance
- **CPU Usage**: <10% at idle, scales with request volume

## Support & Issues

For production issues or questions, refer to:
- [Angular SSR Documentation](https://angular.dev/guide/ssr)
- [Express.js Documentation](https://expressjs.com/)
- GitHub Issues in the repository

## License

See the main README.md for license information.

