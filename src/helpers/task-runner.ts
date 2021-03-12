import { Injectable } from "@nestjs/common";
import { PuppeteerService } from "src/services/puppeteer/puppeteer.service";

@Injectable()
export class TaskRunner {
  constructor(private readonly puppeteerService: PuppeteerService)  {}
  // constructor(@InjectBrowser() private readonly browser: Browser) {}

  async runTask() {
    // this.cronService.startProcess()
    console.log('Process has been started 2!');
    await this.puppeteerService.startUp();

    await this.puppeteerService.goTo('https://www.google.com/');
  }
}
