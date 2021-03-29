import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ErrorHandler } from '@shared/error/error-handler.decorator';
import { CustomError } from '@shared/error/models/custom-error.class';
import { LoggerService } from '@shared/logger/logger.service';
import { LoggerMessage } from '@shared/logger/models/logger-message.class';
import { EConfiguration } from 'src/config/enum/config-keys.enum';
import { ConfigService } from 'src/config/services/config.service';
import { TaskRunner } from 'src/helpers/task-runner';

@Injectable()
export class CronService {
    constructor(private readonly taskRunner: TaskRunner, private readonly _configService: ConfigService, private readonly loggerService: LoggerService) { }

    @Cron(CronExpression.EVERY_MINUTE)
    @ErrorHandler()
    async startProcess() {
        try {
            this.loggerService.log(
                new LoggerMessage('CronService start process', 'Service.CronService.startProcess')
            );

            if (this.isActiveTask())
                await this.taskRunner.runTask();
        }
        catch (error) {
            this.loggerService.error(new LoggerMessage(
                'Could not run the periodic procedure',
                'Service.CronService.startProcess',
                error
            ));

            throw new CustomError(error, 'CronService', 'startProcess');
        }
    }

    isActiveTask() {
        return this._configService.get(EConfiguration.ACTIVE) === 'true';
    }
}
