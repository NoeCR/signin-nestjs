import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { LoggerMessage } from './models/logger-message.class';

@Injectable()
export class LoggerService {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) { }

  debug(loggerMessage: LoggerMessage): void {
    this.logger.debug(loggerMessage);
  };

  log(loggerMessage: LoggerMessage): void {
    this.logger.log(loggerMessage);
  };

  warn(loggerMessage: LoggerMessage): void {
    this.logger.warn(loggerMessage);
  };

  error(loggerMessage: LoggerMessage): void {
    this.logger.error(loggerMessage);
  };
}
