/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Provider } from '@nestjs/common';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

class WinstonLogger implements LoggerService {
  constructor(private readonly logger: winston.Logger) {}
  log(message: any, context?: string) {
    this.logger.info(message, context ? { context } : undefined);
  }
  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }
  warn(message: any, context?: string) {
    this.logger.warn(message, context ? { context } : undefined);
  }
  debug?(message: any, context?: string) {
    this.logger.debug(message, context ? { context } : undefined);
  }
  verbose?(message: any, context?: string) {
    this.logger.verbose(message, context ? { context } : undefined);
  }
}

export const LoggerProvider: Provider = {
  provide: WinstonLogger,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const level = (config.get<string>('LOG_LEVEL') ??
      'info') as winston.LoggerOptions['level'];
    const dir = config.get<string>('LOG_DIR') ?? 'logs';
    const json = (config.get<string>('LOG_JSON') ?? 'false') === 'true';
    const pattern = config.get<string>('LOG_ROTATE_PATTERN') ?? 'YYYY-MM-DD';
    const zipped = (config.get<string>('LOG_ZIP') ?? 'true') === 'true';
    const maxSize = config.get<string>('LOG_MAX_SIZE') ?? '20m';
    const maxFiles = config.get<string>('LOG_MAX_FILES') ?? '14d';

    const transports: winston.transport[] = [
      new DailyRotateFile({
        dirname: dir,
        filename: 'app-%DATE%.log',
        datePattern: pattern,
        zippedArchive: zipped,
        maxSize,
        maxFiles,
        level,
      }),
      new winston.transports.Console({ level }),
    ];

    const format = json
      ? winston.format.json()
      : winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf(({ level, message, timestamp, context }) => {
            const msg =
              typeof message === 'string' ? message : JSON.stringify(message);
            const ctx = typeof context === 'string' ? ` ${context}` : '';
            return `${String(timestamp)} [${String(level)}]${ctx} ${msg}`;
          }),
        );

    const logger = winston.createLogger({ level, format, transports });
    return new WinstonLogger(logger);
  },
};

export { WinstonLogger };
