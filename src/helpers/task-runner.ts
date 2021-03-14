import { Injectable } from "@nestjs/common";
import { PuppeteerService } from "src/services/puppeteer/puppeteer.service";
import { DateTime } from 'luxon';
import { scheduleStrategy } from "./schedule-strategy";
import { ConfigService } from "src/config/services/config.service";
import { mustRunTask } from "src/validators/execute-task.validator";
import { Time } from "@shared/types/time.type";
@Injectable()
export class TaskRunner {
  constructor(private readonly puppeteerService: PuppeteerService, readonly configService: ConfigService) { }

  async runTask() {
    try {
      console.log('Process has been started!');
      // TODO: Obtener instancia de la tarea a ejecutar
      const schedule = scheduleStrategy(this.configService);
      // console.log('schedule ', { schedule });
      const task = schedule.getScheduledTask();
      // console.log('task ', { task });
      // TODO: ajustar la hora GMT
      const gmtTime = DateTime.local().setZone('Europe/Madrid').toFormat('T') as Time;
      // console.log('runTask ', { gmtTime })
      // TODO: Comprobar si se ha de relaizar la tarea
      const isTimeToExecute = mustRunTask(task, gmtTime);
      if (!isTimeToExecute) return;

      // TODO: Inicializar Puppeteer
      await this.puppeteerService.startUp();

      console.log('Process has been started 2!');
      await this.puppeteerService.goTo(`${task.url}/login`);

      for (const step of task.loginSteps) {
        await this.puppeteerService.doStep(step);
      }
      // TODO: Validar que la tarea se ha llevado a cabo
      // TODO: Notificar


      // await this.puppeteerService.goTo('https://www.google.com/');
    }
    catch (error) {
      console.log(error);
    }
  }
}
