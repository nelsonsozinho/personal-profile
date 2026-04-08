import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { type Request, type Response, type NextFunction } from 'express';
import compression from 'compression';
import helmet from 'helmet';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');
const NODE_ENV = process.env['NODE_ENV'] || 'development';
const port = parseInt(process.env['PORT'] || '4000', 10);

// Validate required environment variables
function validateEnvironment(): void {
  if (!['development', 'production', 'staging'].includes(NODE_ENV)) {
    throw new Error(
      `Invalid NODE_ENV: ${NODE_ENV}. Must be one of: development, production, staging`,
    );
  }
}

// Configure logging
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function logRequest(req: Request, _res: Response, next: NextFunction): void {
  const requestId = generateRequestId();
  const timestamp = new Date().toISOString();
  const userAgent = req.get('user-agent') || 'Unknown';
  const ip = req.ip || req.socket.remoteAddress || 'Unknown';

  // Store requestId for later use
  (req as any).requestId = requestId;

  console.log(
    JSON.stringify({
      timestamp,
      level: 'INFO',
      requestId,
      method: req.method,
      path: req.path,
      ip,
      userAgent: userAgent.substring(0, 100),
      environment: NODE_ENV,
    }),
  );
  next();
}

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Security middleware: Apply security headers via Helmet
 * Configurable for production deployments
 */
const getAllowedOrigins = (): string[] => {
  const envOrigins = process.env['ALLOWED_ORIGINS'];
  if (envOrigins) {
    return envOrigins.split(',').map((origin) => origin.trim());
  }
  // Default: only self, update in environment variables for production
  return ['https://nelsonsozinho.dev'];
};

const apiUrl = process.env['API_URL'] || "'self'";

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'https:'],
        connectSrc: ["'self'", apiUrl],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }),
);

/**
 * Compression middleware
 */
app.use(compression());

/**
 * Request logging middleware
 */
app.use(logRequest);

/**
 * Example Express Rest API endpoints can be defined here.
 * Add endpoints before the static files and SSR middleware.
 *
 * Example:
 * ```ts
 * app.get('/api/health', (req, res) => {
 *   res.json({ status: 'ok', timestamp: new Date().toISOString() });
 * });
 * ```
 */

/**
 * Health check endpoint for container orchestration systems
 */
app.get('/health', (_req: Request, res: Response): void => {
  const memoryUsage = process.memoryUsage();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime(),
    port,
    nodeVersion: process.version,
    memory: {
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
    },
  });
});

/**
 * Serve static files from /browser with aggressive caching
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
    etag: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 * Add a timeout to prevent indefinite SSR rendering.
 */
app.use((req: Request, res: Response, next: NextFunction): void => {
  const renderTimeout = setTimeout(() => {
    if (!res.headersSent) {
      const requestId = (req as any).requestId || 'unknown';
      console.error(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'ERROR',
          requestId,
          type: 'SSR_TIMEOUT',
          path: req.path,
          message: 'SSR rendering exceeded 30 second timeout',
          environment: NODE_ENV,
        }),
      );
      res.status(504).send('Service Unavailable - Render Timeout');
    }
  }, 30000); // 30 second timeout

  angularApp
    .handle(req)
    .then((response) => {
      clearTimeout(renderTimeout);
      return response ? writeResponseToNodeResponse(response, res) : next();
    })
    .catch((error) => {
      clearTimeout(renderTimeout);
      const requestId = (req as any).requestId || 'unknown';
      console.error(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'ERROR',
          requestId,
          type: 'SSR_ERROR',
          path: req.path,
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          environment: NODE_ENV,
        }),
      );
      if (!res.headersSent) {
        res.status(500).send('Internal Server Error');
      }
    });
});

/**
 * Global error handling middleware
 */
app.use(
  (err: Error, req: Request, res: Response, _next: NextFunction): void => {
    const requestId = (req as any).requestId || 'unknown';
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        requestId,
        type: 'GLOBAL_ERROR',
        path: req.path,
        message: err.message,
        stack: err.stack,
        environment: NODE_ENV,
      }),
    );
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        requestId,
        ...(NODE_ENV === 'development' && { message: err.message, stack: err.stack }),
      });
    }
  },
);

/**
 * 404 Not Found handler
 */
app.use((_req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    statusCode: 404,
  });
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  try {
    validateEnvironment();
    app.listen(port as number, (): void => {
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'INFO',
          type: 'SERVER_START',
          message: 'Node Express server started',
          environment: NODE_ENV,
          port,
          nodeVersion: process.version,
          address: `http://0.0.0.0:${port}`,
        }),
      );
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'INFO',
          type: 'HEALTH_CHECK',
          message: 'Health check endpoint available',
          url: `http://0.0.0.0:${port}/health`,
        }),
      );
    });
  } catch (error) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'FATAL',
        type: 'STARTUP_ERROR',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }),
    );
    process.exit(1);
  }
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
