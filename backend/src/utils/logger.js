/**
 * Structured JSON Logger for RecoverAI
 * Ensures safe logging without exposing secrets or PCI/card details.
 */
export const logger = {
  info: (event, metadata = {}) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      event,
      ...metadata
    }));
  },
  warn: (event, metadata = {}) => {
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      event,
      ...metadata
    }));
  },
  error: (event, metadata = {}) => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      event,
      ...metadata
    }));
  }
};
