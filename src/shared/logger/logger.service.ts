import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { LoggerMessage } from './models/logger-message.class';
import { Logger } from 'winston';

@Injectable()
export class LoggerService {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) { }

  debug(loggerMessage: LoggerMessage): void {
    this.logger.debug('debug', loggerMessage as any);
  };

  log(loggerMessage: LoggerMessage): void {
    try {
      console.log('LoggerService - log', loggerMessage);
      this.logger.log('info', loggerMessage as any);
    }
    catch (error) {
      console.log('LoggerService - log - error', error);
    }
  };

  warn(loggerMessage: LoggerMessage): void {
    this.logger.warn('warn', loggerMessage as any);
  };

  error(loggerMessage: LoggerMessage): void {
    this.logger.error('error', loggerMessage as any);
  };
}
