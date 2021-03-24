import { Injectable } from "@nestjs/common";
import { PuppeteerService } from "src/services/puppeteer/puppeteer.service";
import { DateTime } from 'luxon';
import { scheduleStrategy } from "./schedule-strategy";
import { ConfigService } from "src/config/services/config.service";
import { shouldRunTask } from "src/validators/execute-task.validator";
import { Time } from "@shared/types/time.type";
import { EConfiguration } from "src/config/enum/config-keys.enum";
import { IRunTask } from "src/interfaces/run-task.interface";
import { CustomError } from "@shared/error/models/custom-error.class";
@Injectable()
export class TaskRunner {
  constructor(
    private readonly puppeteerService: PuppeteerService,
    private readonly configService: ConfigService,
  ) { }

  async runTask() {
    try {
      const schedule = scheduleStrategy(this.configService);

      const task = schedule.getScheduledTask();

      const gmtTime = DateTime.local().setZone('Europe/Madrid').toFormat('T') as Time;

      const initTask: IRunTask = shouldRunTask(task, gmtTime);
      if (!initTask.isTime) return;

      await this.puppeteerService.startUp({
        username: task.username,
        password: task.password,
        userId: task.userId,
        action: initTask.action,
      });

      await this.puppeteerService.goTo(`${task.url}${this.configService.get(EConfiguration.LOGIN_PATH)}`);

      for (const step of task.loginSteps) {
        await this.puppeteerService.doStep(step);
      }

      for (const step of task.jobSteps) {
        await this.puppeteerService.doStep(step);
      }
    }
    catch (error) {
      throw new CustomError(error, 'TaskRunner', 'runTask', 'The execution of the task could not be carried out.');
    }
  }
}
