import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EConfiguration } from 'src/config/enum/config-keys.enum';
import { ConfigService } from 'src/config/services/config.service';
import { TaskRunner } from 'src/helpers/task-runner';

@Injectable()
export class CronService {
    constructor(private readonly taskRunner: TaskRunner, private readonly _configService: ConfigService) { }
    // TODO: Use Better CronExpression.EVERY_QUARTER
    /**
     * Every 10 seconds: 
     // 'Asterisco/10 * * * * *'
     CronExpression.EVERY_MINUTE
     */
    @Cron(CronExpression.EVERY_MINUTE)
    async startProcess() {
        console.log('CronService ', CronExpression.EVERY_QUARTER)
        console.log('CronService isActiveTask ', this.isActiveTask())
        if (this.isActiveTask())
            await this.taskRunner.runTask();
    }

    isActiveTask() {
        return this._configService.get(EConfiguration.ACTIVE) === 'true';
    }
}
