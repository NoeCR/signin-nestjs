import { Injectable } from '@nestjs/common';
import { EAction } from '@shared/enum/action.enum';
import * as puppeteer from 'puppeteer';
import { EConfiguration } from 'src/config/enum/config-keys.enum';
import { ConfigService } from 'src/config/services/config.service';
import { IDomainCookies } from 'src/interfaces/domain-cookies.interface';
import { IStep } from 'src/interfaces/step.interface';
import { CryptoService } from '../crypto/crypto.service';
import { HoldedService } from '../holded/holded.service';
import { DateTime } from 'luxon';

interface ICredentials { username: string, password: string, userId: string };
@Injectable()
export class PuppeteerService {
  private page: any;
  private browser: any;
  private credentials: ICredentials;
  private cookies: IDomainCookies;
  private result: any;

  constructor(
    private readonly _configService: ConfigService,
    private readonly cryptoService: CryptoService,
    private readonly holdedService: HoldedService,
  ) {
    this.page = null;
    this.browser = null;
    this.result = {};
  }

  async startUp(credentials: ICredentials) {
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

      this.credentials = credentials;
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
      console.log('goTo Error ', error);
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
      case EAction.COOKIES:
        await this.getDomainCookies(step.selector);
        break;
      case EAction.REQUEST:
        await this._prepareAndDoRequest(step.selector, step.returnAs)
        break;
      case EAction.NAVIGATE:
        const url = `${this._configService.get(EConfiguration.BASE_URL)}/${step.selector}`
        await this.goTo(url);
        break;
      default:
        throw new Error('Action not implemented');
    }
  }

  private async _prepareAndDoRequest(selector: string, returnAs: string) {
    try {
      switch (selector) {
        case 'holded':
          const month = DateTime.local().setZone('Europe/Madrid').toFormat('L');
          const year = DateTime.local().setZone('Europe/Madrid').toFormat('y');

          this.result[returnAs] = await this.holdedService.getHolidaysList(month, year, this.cookies);
          console.log(this.result[returnAs].data);
          break;

        default:
          throw new Error('Service not implemented');
      }

      return;
    }
    catch (error) {
      console.log('_prepareAndDoRequest ', error);
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
      await this.page.waitForSelector(selector);

      await this.page.type(selector, await this._parseText(text));
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

  async _parseText(text: string): Promise<string> {
    try {
      text = text.trim();
      let parsed;

      switch (text) {
        case '{USERNAME}':
          parsed = this.credentials.username;
          break;
        case '{PASSWORD}':
          parsed = await this.cryptoService.decrypt(this.credentials.password);
          break;
        case '{USER_ID}':
          parsed = this.credentials.userId.replace(/_/g, ' ');
          break;
        default:
          parsed = text;
      }

      return parsed;
    }
    catch (error) {
      console.log(error);
    }
  }

  async getDomainCookies(selectors: string): Promise<void> {
    try {
      // Get all cookies for make API call
      this.cookies = await this.page._client.send('Network.getAllCookies');
      console.log('getDomainCookies ', this.cookies);
      this.processCookies(selectors);
      return;
    } catch (error) {
      console.log(error);
    }
  }

  private processCookies(selectors: string): void {
    try {
      console.log('processCookies ')
      const selectorNames = selectors.split(',');
      const cookiesForRequest = [];

      for (const cookie of this.cookies.cookies) {
        if (
          selectorNames.includes(cookie.name)
          && cookie.domain.endsWith(this._configService.get(EConfiguration.DOMAIN))
        ) {
          cookiesForRequest.push(cookie);
        }
      }

      this.cookies.cookies = cookiesForRequest;

      console.log('processCookies Cookies Filtered ', this.cookies);
    }
    catch (error) {
      console.log('processCookies ', error)
    }
  }
}
