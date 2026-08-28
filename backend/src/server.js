import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info('SERVER_STARTED', {
    port: config.port,
    environment: config.nodeEnv
  });
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM_RECEIVED', { message: 'Closing HTTP server' });
  server.close(() => {
    logger.info('SERVER_CLOSED');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT_RECEIVED', { message: 'Closing HTTP server' });
  server.close(() => {
    logger.info('SERVER_CLOSED');
    process.exit(0);
  });
});
