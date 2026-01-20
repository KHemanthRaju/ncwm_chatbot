/**
 * Production-ready logger utility
 * Replaces console.log with environment-aware logging
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const CURRENT_LOG_LEVEL = LOG_LEVELS[process.env.REACT_APP_LOG_LEVEL?.toUpperCase() || 'INFO'];

class Logger {
  constructor(context = 'APP') {
    this.context = context;
  }

  /**
   * Format log message with timestamp and context
   */
  formatMessage(level, message, data) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}] [${this.context}]`;

    if (data) {
      return `${prefix} ${message}`;
    }
    return `${prefix} ${message}`;
  }

  /**
   * Send logs to monitoring service in production
   */
  sendToMonitoring(level, message, data) {
    if (process.env.NODE_ENV !== 'production') return;

    try {
      // Send to CloudWatch, Datadog, or other monitoring service
      // Example: fetch to logging endpoint
      /*
      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          message,
          data,
          context: this.context,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });
      */
    } catch (error) {
      // Fail silently
    }
  }

  /**
   * Error logs - always shown
   */
  error(message, error) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.ERROR) {
      const formattedMessage = this.formatMessage('ERROR', message);
      console.error(formattedMessage, error);
      this.sendToMonitoring('ERROR', message, { error: error?.message, stack: error?.stack });
    }
  }

  /**
   * Warning logs - shown in warn, info, debug modes
   */
  warn(message, data) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.WARN) {
      const formattedMessage = this.formatMessage('WARN', message, data);
      console.warn(formattedMessage, data);
      this.sendToMonitoring('WARN', message, data);
    }
  }

  /**
   * Info logs - shown in info and debug modes
   */
  info(message, data) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
      const formattedMessage = this.formatMessage('INFO', message, data);
      console.info(formattedMessage, data);
      this.sendToMonitoring('INFO', message, data);
    }
  }

  /**
   * Debug logs - only shown in debug mode
   */
  debug(message, data) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
      const formattedMessage = this.formatMessage('DEBUG', message, data);
      console.log(formattedMessage, data);
    }
  }

  /**
   * Log user actions for analytics
   */
  trackEvent(eventName, eventData) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
      this.info(`Event: ${eventName}`, eventData);
    }

    // Send to analytics service
    if (process.env.NODE_ENV === 'production') {
      try {
        // Example: Send to Google Analytics, Mixpanel, etc.
        /*
        if (window.gtag) {
          window.gtag('event', eventName, eventData);
        }
        */
      } catch (error) {
        // Fail silently
      }
    }
  }

  /**
   * Log performance metrics
   */
  performance(metricName, duration) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
      this.info(`Performance: ${metricName}`, { duration: `${duration}ms` });
    }

    this.sendToMonitoring('PERFORMANCE', metricName, { duration });
  }
}

// Create singleton logger instances for different parts of the app
export const logger = new Logger('APP');
export const chatLogger = new Logger('CHAT');
export const authLogger = new Logger('AUTH');
export const apiLogger = new Logger('API');
export const adminLogger = new Logger('ADMIN');

// Export Logger class for creating custom loggers
export default Logger;