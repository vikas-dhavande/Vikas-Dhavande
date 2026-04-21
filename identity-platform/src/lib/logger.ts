type LogLevel = 'info' | 'warn' | 'error' | 'security';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

class Logger {
  private log(level: LogLevel, message: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata,
    };

    // In a real application, you would send this to a logging service (e.g., Axiom, Datadog, Sentry)
    // For now, we'll log to console with appropriate formatting
    const color = level === 'security' ? '\x1b[35m' : level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : '\x1b[32m';
    const reset = '\x1b[0m';

    console.log(`${color}[${level.toUpperCase()}]${reset} ${entry.timestamp}: ${message}`, metadata || '');
  }

  info(message: string, metadata?: Record<string, any>) {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: Record<string, any>) {
    this.log('error', message, metadata);
  }

  security(message: string, metadata?: Record<string, any>) {
    this.log('security', message, metadata);
  }
}

export const logger = new Logger();
