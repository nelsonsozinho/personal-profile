# CI/CD Deployment Guide

## GitHub Actions Example

Create a file `.github/workflows/deploy.yml`:

```yaml
name: Build & Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [22.x]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Build application
        run: npm run build:prod

      - name: Archive build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  docker:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/personal-profile:latest
            ${{ secrets.DOCKER_USERNAME }}/personal-profile:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: docker
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to production
        run: |
          # Example: Deploy via SSH
          echo "Deploying to production..."
          # Add your deployment logic here (e.g., SSH to server, pull Docker image, restart)

      - name: Health check
        run: |
          sleep 10
          curl -f https://nelsonsozinho.dev/health || exit 1

      - name: Notify Slack
        if: always()
        uses: slackapi/slack-github-action@v1.24.0
        with:
          payload: |
            {
              "text": "Deployment ${{ job.status }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Deployment Status:* ${{ job.status }}\n*Branch:* ${{ github.ref }}\n*Commit:* <${{ github.server_url }}/${{ github.repository }}/commit/${{ github.sha }}|${{ github.sha }}>"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## Required GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

| Secret | Description | Example |
|--------|-------------|---------|
| `DOCKER_USERNAME` | Docker Hub username | `nelsonsozinho` |
| `DOCKER_PASSWORD` | Docker Hub access token | `dckr_pat_...` |
| `SLACK_WEBHOOK` | Slack webhook URL | `https://hooks.slack.com/...` |
| `PRODUCTION_SERVER_KEY` | SSH private key | (base64 encoded) |

## GitLab CI Example

Create `.gitlab-ci.yml`:

```yaml
stages:
  - test
  - build
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: '/certs'
  NPM_TOKEN: $CI_JOB_TOKEN

test:
  stage: test
  image: node:22
  before_script:
    - npm ci
  script:
    - npm run lint
    - npm test
    - npm run build:prod
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour
  cache:
    paths:
      - node_modules/

docker:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE:latest
    - docker push $CI_REGISTRY_IMAGE:latest
  only:
    - main

deploy:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$DEPLOY_KEY" | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
  script:
    - ssh -o StrictHostKeyChecking=no user@production.com 'docker pull $CI_REGISTRY_IMAGE:latest && docker-compose up -d'
  only:
    - main
```

## Deployment Strategies

### 1. Blue-Green Deployment (Kubernetes)

```bash
#!/bin/bash

# Deploy new version (green)
kubectl set image deployment/personal-profile-green \
  personal-profile=$IMAGE:$VERSION \
  -n production

# Wait for rollout
kubectl rollout status deployment/personal-profile-green -n production

# Health check
for i in {1..30}; do
  if kubectl run -it --rm curl --image=curlimages/curl --restart=Never -- \
    curl http://personal-profile-green:4000/health > /dev/null 2>&1; then
    echo "Green deployment healthy"
    break
  fi
  sleep 2
done

# Switch traffic (blue -> green)
kubectl patch service personal-profile -p \
  '{"spec":{"selector":{"version":"green"}}}' \
  -n production

# Keep old version (blue) for quick rollback
```

### 2. Rolling Update (Docker Compose)

```yaml
version: '3.8'

services:
  personal-profile:
    image: nelsonsozinho/personal-profile:latest
    ports:
      - '4000:4000'
    environment:
      NODE_ENV: production
      API_URL: https://api.example.com
    restart: unless-stopped
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:4000/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 3. Canary Deployment (Kubernetes)

```yaml
apiVersion: flagger.app/v1beta1
kind: Canary
metadata:
  name: personal-profile
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: personal-profile
  progressDeadlineSeconds: 60
  service:
    port: 4000
  analysis:
    interval: 1m
    threshold: 5
    maxWeight: 50
    stepWeight: 10
    metrics:
      - name: request-success-rate
        thresholdRange:
          min: 99
        interval: 1m
      - name: request-duration
        thresholdRange:
          max: 500
        interval: 1m
  webhooks:
    - name: smoke-tests
      url: http://flagger-loadtester/
      timeout: 30s
      metadata:
        type: bash
        cmd: 'curl -sd "test" http://personal-profile-canary:4000/ | grep -q title'
```

## Monitoring & Alerting

### Prometheus Metrics Example

Add to your monitoring stack:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'personal-profile'
    static_configs:
      - targets: ['localhost:4000']
    metrics_path: '/metrics'
```

### Alerting Rules

```yaml
groups:
  - name: personal-profile
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: 'High error rate detected'

      - alert: HighMemoryUsage
        expr: process_resident_memory_bytes > 300000000
        for: 5m
        annotations:
          summary: 'Memory usage exceeds 300MB'

      - alert: SlowResponse
        expr: histogram_quantile(0.95, http_request_duration_seconds_bucket) > 1
        for: 5m
        annotations:
          summary: 'p95 response time exceeds 1s'
```

## Security Scanning

### OWASP Dependency Check

```bash
# Install
npm install -g @owasp/dependency-check

# Scan
dependency-check --scan ./node_modules --format json --out ./reports
```

### Container Scanning (Trivy)

```bash
# Install
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin

# Scan image
trivy image personal-profile:latest
```

### SAST (Static Analysis)

```bash
# SonarQube scanner
npm install -g sonarqube-scanner

# Scan
sonar-scanner \
  -Dsonar.projectKey=personal-profile \
  -Dsonar.sources=src \
  -Dsonar.host.url=https://sonarqube.example.com
```

## Rollback Procedure

```bash
# Kubernetes
kubectl rollout undo deployment/personal-profile -n production

# Docker Stack
docker stack deploy --compose-file docker-compose.yml personal-profile \
  --with-registry-auth

# Manual
docker stop personal-profile
docker run -d --name personal-profile \
  -p 4000:4000 \
  -e NODE_ENV=production \
  nelsonsozinho/personal-profile:previous-version
```

## Post-Deployment Checklist

- [ ] Health check responding (GET /health)
- [ ] Application accessible via HTTPS
- [ ] Security headers present
- [ ] Logs being collected correctly
- [ ] Monitoring/metrics flowing
- [ ] Alerts triggered successfully
- [ ] Error tracking functional
- [ ] Performance metrics baseline established

