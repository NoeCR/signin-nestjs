import { Injectable } from '@nestjs/common';
import { EAction } from '@shared/enum/action.enum';
import * as puppeteer from 'puppeteer';
import { EConfiguration } from 'src/config/enum/config-keys.enum';
import { ConfigService } from 'src/config/services/config.service';
import { IStep } from 'src/interfaces/step.interface';

@Injectable()
export class PuppeteerService {
  private page: any;
  private browser: any;

  constructor(private readonly _configService: ConfigService) {
    this.page = null;
    this.browser = null;
  }

  async startUp() {
    try {
      this.browser = await puppeteer.launch({
        headless: false,
        slowMo: 10,
        defaultViewport: null,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          "--disable-setui-sandbox",
          "--disable-web-security",
          "--window-size=1920,1080"
        ]
      });

      this.page = await this.browser.newPage();
      await this.page.setCacheEnabled(false);

      return;
    } catch (error) {
      throw new Error('Start UP failed!')
    }
  }

  async close() {
    try {
      this.page.close();
      this.browser.close();
    } catch (error) {
      throw new Error('Close failed!')
    }
  }

  async goTo(url: string): Promise<void> {
    try {
      await this.page.goto(url, {
        timeout: parseInt(this._configService.get(EConfiguration.TIMEOUT)),
        waitUntil: 'networkidle2'
      });
    } catch (error) {
      throw new Error(`Error`)
    }
  }

  async doStep(step: IStep) {
    switch (step.action) {
      case EAction.CLICK:
        await this.waitAndClick(step.selector);
        break;
      case EAction.INNER_TEXT:
        await this.waitAndGetText(step.selector);
        break;
      case EAction.TAKE_SCREENSHOT:
        // TODO: Implementar metodo para tomar captura de pantalla
        break;
      case EAction.TYPE:
        await this.waitAndType(step.selector, step.text);
        break;
      case EAction.VALIDATE:
        // TODO: validar requisitos
        break;
      default:
        throw new Error('Action not implemented');
    }
  }

  async waitAndClick(selector) {
    try {
      await this.page.waitForSelector(selector)
      await this.page.click(selector)
    } catch (error) {
      throw new Error(`Could not click into selector: ${selector}`)
    }
  }

  async waitAndType(selector, text) {
    try {
      await this.page.waitForSelector(selector)
      await this.page.type(selector, text)
    } catch (error) {
      throw new Error(`Could not type '${text}', into selector: ${selector}`)
    }
  }

  async waitAndGetText(selector) {
    try {
      await this.page.waitForSelector(selector);

      return await this.page.$eval(selector, el => el.innerHTML);
    } catch (error) {
      throw new Error(`Could not get text from selector: ${selector}`)
    }
  }

  async waitAndGetCount(selector) {
    try {
      await this.page.waitForSelector(selector);

      return await this.page.$$eval(selector, el => el.length);
    } catch (error) {
      throw new Error(`Could not get count from selector: ${selector}`)
    }
  }
}
