FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
COPY . .
RUN npm run build:prod

FROM node:22-bookworm-slim AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
FROM node:22-bookworm-slim AS runner
WORKDIR /app

# Create non-root user for security (use -o to allow duplicate UID if it exists)
RUN useradd -m -u 1000 appuser 2>/dev/null || useradd -m appuser

# Set environment to production
ENV NODE_ENV=production
ENV PORT=4000

# Copy dependencies and build artifacts
COPY --from=prod-deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY --from=builder /app/dist ./dist

# Switch to non-root user
USER appuser

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 4000

CMD ["npm", "run", "serve:ssr:personal-profile"]

