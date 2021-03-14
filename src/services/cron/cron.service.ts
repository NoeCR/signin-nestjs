import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TaskRunner } from 'src/helpers/task-runner';

@Injectable()
export class CronService {
    constructor(private readonly taskRunner: TaskRunner) { }
    // TODO: Use Better CronExpression.EVERY_QUARTER
    @Cron('*/10 * * * * *')
    async startProcess() {
        console.log('CronService ', CronExpression.EVERY_QUARTER)
        await this.taskRunner.runTask();
    }
}
