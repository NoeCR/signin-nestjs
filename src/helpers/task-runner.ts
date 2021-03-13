import { Injectable } from "@nestjs/common";
import { PuppeteerService } from "src/services/puppeteer/puppeteer.service";

@Injectable()
export class TaskRunner {
  constructor(private readonly puppeteerService: PuppeteerService) { }

  async runTask() {
    console.log('Process has been started 2!');
    // TODO: ajustar la hora GMT
    // TODO: Comprobar si se ha de relaizar la tarea
    // TODO: Comprobar que tipo de tarea se ha de realizar
    // TODO: Validar que la tarea se ha llevado a cabo
    // TODO: Notificar

    await this.puppeteerService.startUp();

    // await this.puppeteerService.goTo('https://www.google.com/');
  }
}
