/**
 * Production environment configuration
 */
export const environment = {
  production: true,
  apiUrl: process.env['API_URL'] || 'https://api.example.com',
  logLevel: 'info',
  enableErrorTracking: true,
  ssrTimeout: 30000,
};

