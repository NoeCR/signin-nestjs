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
import { mockedCookies } from 'mock/assets/cookies-mock';
import { shouldExecuteTask } from 'src/validators/execute-task.validator';
import { IPuppeteerParams } from 'src/interfaces/puppeteer-params.interface';
import { ICredentials } from 'src/interfaces/credentials.interface';
import { EHoldedButtons } from '@shared/enum/holded-buttons.enum';
import { Notification } from '../../helpers/notification';
import { notificationStrategy } from 'src/helpers/notification-strategy';


@Injectable()
export class PuppeteerService {
  private page: any;
  private browser: any;
  private credentials: ICredentials;
  private cookies: IDomainCookies;
  private result: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
    private readonly holdedService: HoldedService,
    // private readonly _notificationService: NotificationService,
  ) {
    this.page = null;
    this.browser = null;
    this.result = {};
  }

  async startUp(initParams: IPuppeteerParams) {
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

      this.credentials = {
        username: initParams.username,
        password: initParams.password,
        userId: initParams.userId
      };

      this.result.action = initParams.action;

      if (this.configService.get(EConfiguration.NODE_ENV) === 'test')
        await this.page.setCookie(...mockedCookies.cookies);

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
        timeout: parseInt(this.configService.get(EConfiguration.TIMEOUT)),
        waitUntil: 'networkidle2'
      });
    } catch (error) {
      console.log('goTo Error ', error);
      throw new Error(`Error`)
    }
  }

  async doStep(step: IStep) {
    try {
      switch (step.action) {
        case EAction.CLICK:
          console.log('Click on button? ', this.result.execute);
          if (this.result.execute) {
            const selector = this.result[step.selector]
              .includes(EHoldedButtons.BTN_LOCK_IN)
              ? `.${EHoldedButtons.BTN_LOCK_OUT}`
              : `.${EHoldedButtons.BTN_LOCK_IN}`;

            await this.waitAndClick(selector);
          }
          break;
        case EAction.INNER_TEXT:
          await this.waitAndGetText(step.selector);
          break;
        case EAction.TAKE_SCREENSHOT:
          console.log(EAction.TAKE_SCREENSHOT);
          await this._takeScreenshot({ encoding: step.selector, returnAs: step.returnAs })
          break;
        case EAction.TYPE:
          await this.waitAndType(step.selector, step.text);
          break;
        case EAction.VALIDATE:
          this.result[step.returnAs] = shouldExecuteTask(this.result, step.selector);
          break;
        case EAction.COOKIES:
          await this.getDomainCookies(step.selector);
          break;
        case EAction.REQUEST:
          await this._prepareAndDoRequest(step.selector, step.returnAs)
          break;
        case EAction.NAVIGATE:
          const url = `${this.configService.get(EConfiguration.BASE_URL)}/${step.selector}`
          await this.goTo(url);
          break;
        case EAction.XPATH:
          console.log(EAction.XPATH);
          await this.waitAndGetElementByXPath(await this._parseText(step.selector), step.returnAs);
          break;
        case EAction.EVALUATE:
          console.log(EAction.EVALUATE);
          await this.waitAndEvaluate(step.selector, step.returnAs);
          break;
        case EAction.NOTIFY:
          console.log(EAction.NOTIFY);
          await this._prepareAndNotify(step.selector);
          break;
        default:
          throw new Error('Action not implemented');
      }
    }
    catch (error) {
      console.log(error)
    }
  }

  async waitAndClick(selector) {
    try {
      console.log('waitAndClick ', selector);
      await this.page.waitForSelector(selector);
      console.log('waitAndClick CLICK ', selector);
      await this.page.click(selector);
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

  async waitAndGetElementByXPath(selector, returnAs) {
    try {
      await this.page.waitForXPath(`//span[contains(.,'${selector}')]`);

      // Get div that contains span with user identifier
      const [div] = await this.page.$x(`//span[contains(.,'${selector}')]/parent::div`);

      // Extract attributes from HTML div
      const props = await this.page.evaluate(
        element => Array.from(element.attributes, ({ name, value }) => `${name}: ${value}`),
        div
      );

      this.result[returnAs] = props;

      return;
    } catch (error) {
      console.log('waitAndGetElementByXPath Error ', error);
      throw new Error(`Could not get count from selector: ${selector}`)
    }
  }

  async waitAndEvaluate(selector, returnAs) {
    try {
      await this.page.waitForSelector(selector);
      console.log('waitAndEvaluate ', selector);
      const classList = await this.page.evaluate((selector: string) => {
        console.log(selector);
        return [...document.querySelector(selector).classList]
      }, selector);
      console.log('waitAndEvaluate ', classList);
      this.result[returnAs] = classList;

      return;
    } catch (error) {
      console.log('waitAndEvaluate Error ', error);
      throw new Error(`Could not evaluate selector: ${selector}`)
    }
  }

  private async _prepareAndDoRequest(selector: string, returnAs: string) {
    try {
      switch (selector) {
        case 'holded':
          const month = DateTime.local().setZone('Europe/Madrid').toFormat('L');
          const year = DateTime.local().setZone('Europe/Madrid').toFormat('y');

          this.result[returnAs] = await this.holdedService.getHolidaysList(month, year, this.cookies);

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

  private async _prepareAndNotify(channel: string) {
    try {
      const currentDate = DateTime.local().setZone('Europe/Madrid').toFormat('FFF');
      const filename = `${this.credentials.username}-${currentDate}-${this.result.action}`;

      const _notificationService = new Notification(notificationStrategy(channel, this.configService));

      await _notificationService.sendNotification({
        filename,
        base64string: this.result.base64string
      });

      return;
    }
    catch (error) {
      console.log('_prepareAndNotify ', error);
    }
  }

  async _takeScreenshot(opts) {
    try {
      console.log('_takeScreenshot ')
      this.result[opts.returnAs] = await this.page.screenshot({ encoding: opts.encoding }) as string;
      console.log('_takeScreenshot ', this.result[opts.returnAs])
    }
    catch (error) {
      console.log('waitAndEvaluate Error ', error);
      throw new Error(`Could not take screenshot: ${error}`)
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
      // console.log('getDomainCookies ', this.cookies);
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
          && cookie.domain.endsWith(this.configService.get(EConfiguration.DOMAIN))
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
