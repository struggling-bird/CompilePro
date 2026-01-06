import type { Logger as TypeOrmLogger, QueryRunner } from 'typeorm';
import { WinstonLogger } from './logger.provider';

export class TypeOrmWinstonLogger implements TypeOrmLogger {
  constructor(private readonly logger: WinstonLogger) {}

  logQuery(query: string, parameters?: unknown[], _queryRunner?: QueryRunner) {
    void _queryRunner;
    const params =
      parameters && parameters.length
        ? ` -- params: ${JSON.stringify(parameters)}`
        : '';
    if (this.logger.debug) {
      this.logger.debug(`[query] ${query}${params}`, 'TypeORM');
    } else {
      this.logger.log(`[query] ${query}${params}`, 'TypeORM');
    }
  }

  logQueryError(
    error: string | Error,
    query: string,
    parameters?: unknown[],
    _queryRunner?: QueryRunner,
  ) {
    void _queryRunner;
    const message = typeof error === 'string' ? error : error.message;
    const stack = (error as Error)?.stack;
    const payload = { event: 'query_error', message, query, parameters };
    this.logger.error(JSON.stringify(payload), stack, 'TypeORM');
  }

  logQuerySlow(
    time: number,
    query: string,
    parameters?: unknown[],
    _queryRunner?: QueryRunner,
  ) {
    void _queryRunner;
    const payload = { event: 'query_slow', time, query, parameters };
    this.logger.warn(JSON.stringify(payload), 'TypeORM');
  }

  logSchemaBuild(message: string, _queryRunner?: QueryRunner) {
    void _queryRunner;
    this.logger.log(`[schema] ${message}`, 'TypeORM');
  }

  logMigration(message: string, _queryRunner?: QueryRunner) {
    void _queryRunner;
    this.logger.log(`[migration] ${message}`, 'TypeORM');
  }

  log(
    level: 'log' | 'info' | 'warn',
    message: any,
    _queryRunner?: QueryRunner,
  ) {
    void _queryRunner;
    if (level === 'warn') return this.logger.warn(message, 'TypeORM');
    return this.logger.log(message, 'TypeORM');
  }
}

export default TypeOrmWinstonLogger;
