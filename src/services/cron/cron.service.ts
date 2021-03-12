import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TaskRunner } from 'src/helpers/task-runner';

@Injectable()
export class CronService {
    constructor(private readonly taskRunner: TaskRunner) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async startProcess() {
        await this.taskRunner.runTask();
    }
}
