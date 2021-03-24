import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ErrorHandler } from '@shared/error/error-handler.decorator';
import { CustomError } from '@shared/error/models/custom-error.class';
import { EConfiguration } from 'src/config/enum/config-keys.enum';
import { ConfigService } from 'src/config/services/config.service';
import { TaskRunner } from 'src/helpers/task-runner';

@Injectable()
export class CronService {
    constructor(private readonly taskRunner: TaskRunner, private readonly _configService: ConfigService) { }

    @Cron(CronExpression.EVERY_QUARTER)
    @ErrorHandler()
    async startProcess() {
        try {
            if (this.isActiveTask())
                await this.taskRunner.runTask();
        }
        catch (error) {
            throw new CustomError(error, 'CronService', 'startProcess');
        }
    }

    isActiveTask() {
        return this._configService.get(EConfiguration.ACTIVE) === 'true';
    }
}
