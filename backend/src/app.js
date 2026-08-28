import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
import { logger } from './utils/logger.js';

export const createApp = () => {
  const app = express();

  // Enable CORS for frontend communication
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }));

  // Capture raw body for Razorpay webhook signature verification
  app.use(express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  }));

  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      if (req.path !== '/api/health') {
        logger.info('HTTP_REQUEST', {
          method: req.method,
          path: req.path,
          status: res.statusCode,
          durationMs: Date.now() - start
        });
      }
    });
    next();
  });

  // Base API routes
  app.use('/api', healthRouter);

  // Fallback 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found', path: req.path });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    logger.error('UNHANDLED_ERROR', { error: err.message, stack: err.stack });
    res.status(500).json({ error: 'Internal server error', message: err.message });
  });

  return app;
};
