/**
 * Entry point for the Kaltura video embedding application backend
 * Sets up the Express server with middleware and routes
 */
import dotenv from 'dotenv';

// Load environment variables from .env file BEFORE importing other modules
// This ensures config has access to environment variables
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import ksRoutes from './routes/ks.routes';
import config from './config';

// Create Express application
const app = express();

// Apply middleware
// Apply CORS first to ensure it works properly
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Apply helmet after CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin resource sharing
  hsts: {
    maxAge: 63072000, // 2 years in seconds
    includeSubDomains: true,
    preload: true
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"]
    }
  },
  // These are simple boolean options
  noSniff: true, // X-Content-Type-Options
  frameguard: { action: 'deny' }, // X-Frame-Options
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
app.use(express.json()); // Parse JSON request bodies

// Apply routes
app.use('/api/ks', ksRoutes);

// Health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    status: 500
  });
});

// Start the server
const port = config.server.port;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;
