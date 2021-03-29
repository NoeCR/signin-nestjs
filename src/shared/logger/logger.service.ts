import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class LoggerService {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

  debug(message?: string, component?: string): void {
    this.logger.debug(message)
  };
  info(message: string, component: string): void {};
  warn(message: string, component: string): void {};
  error(message: string, component: string): void {};
}
