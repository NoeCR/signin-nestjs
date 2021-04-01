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
import { mockedCookies } from 'mocks/web/assets/cookies-mock';
import { shouldExecuteTask } from 'src/validators/execute-task.validator';
import { IPuppeteerParams } from 'src/interfaces/puppeteer-params.interface';
import { ICredentials } from 'src/interfaces/credentials.interface';
import { EHoldedButtons } from '@shared/enum/holded-buttons.enum';
import { Notification } from '../../helpers/notification';
import { notificationFactory } from 'src/helpers/notification-factory';
import { CustomError } from '@shared/error/models/custom-error.class';
import { LoggerService } from '@shared/logger/logger.service';
import { LoggerMessage } from '@shared/logger/models/logger-message.class';


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
    private readonly loggerService: LoggerService,
  ) {
    this.page = null;
    this.browser = null;
    this.result = {};
  }

  async startUp(initParams: IPuppeteerParams) {
    try {
      const launchOptions = {
        headless: true,
        slowMo: 10,
        defaultViewport: null,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          "--disable-setui-sandbox",
          "--disable-web-security",
          "--window-size=1920,1080"
        ]
      };

      this.loggerService.log(
        new LoggerMessage('PuppeteerService start up', 'Service.PuppeteerService.startUp.launch', launchOptions)
      );

      this.browser = await puppeteer.launch();

      this.page = await this.browser.newPage();
      await this.page.setCacheEnabled(false);

      this.credentials = {
        username: initParams.username,
        password: initParams.password,
        userId: initParams.userId
      };

      this.result.action = initParams.action;

      // Only for test purpose
      if (this.configService.get(EConfiguration.NODE_ENV) === 'test')
        await this.page.setCookie(...mockedCookies.cookies);

      return;
    } catch (error) {
      const msg = 'Start UP failed!';

      this.loggerService.error(
        new LoggerMessage(msg, 'Service.PuppeteerService.startUp', error)
      );

      throw new CustomError(error, 'PuppeteerService', 'startUp', msg);
    }
  }

  async close() {
    try {
      this.loggerService.log(
        new LoggerMessage('PuppeteerService close', 'Service.PuppeteerService.close')
      );

      this.page.close();
      this.browser.close();
    } catch (error) {
      const msg = 'close failed!';

      this.loggerService.error(
        new LoggerMessage(msg, 'Service.PuppeteerService.close', error)
      );

      throw new CustomError(error, 'PuppeteerService', 'close', msg);
    }
  }

  async goTo(url: string): Promise<void> {
    try {
      this.loggerService.log(
        new LoggerMessage('Navigate to the url', 'Service.PuppeteerService.goTo', { url })
      );

      await this.page.goto(url, {
        timeout: parseInt(this.configService.get(EConfiguration.TIMEOUT)),
        waitUntil: 'networkidle2'
      });
    } catch (error) {
      const msg = 'Unable to access the url';

      this.loggerService.error(
        new LoggerMessage(msg, 'Service.PuppeteerService.close', error)
      );

      throw new CustomError(error, 'PuppeteerService', 'goTo', msg, { url });
    }
  }

  async doStep(step: IStep) {
    try {
      this.loggerService.log(
        new LoggerMessage('Do step', 'Service.PuppeteerService.doStep', { step })
      );

      switch (step.action) {
        case EAction.CLICK:
          if (this.result.execute) {
            const selector = this.result[step.selector]?.includes(EHoldedButtons.BTN_LOCK_IN)
              ? `.${EHoldedButtons.BTN_LOCK_OUT}`
              : `.${EHoldedButtons.BTN_LOCK_IN}`;

            await this.waitAndClick(selector);
          }
          break;
        case EAction.INNER_TEXT:
          await this.waitAndGetText(step.selector);
          break;
        case EAction.TAKE_SCREENSHOT:
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
          await this.waitAndGetElementByXPath(await this._parseText(step.selector), step.returnAs);
          break;
        case EAction.EVALUATE:
          await this.waitAndEvaluate(step.selector, step.returnAs);
          break;
        case EAction.NOTIFY:
          await this._prepareAndNotify(step.selector);
          break;
        default:
          throw new CustomError(null, 'PuppeteerService', 'doStep', 'Action not implemented', { action: step.action });
      }
    }
    catch (error) {
      const msg = 'Step could not be performed';

      this.loggerService.error(
        new LoggerMessage(msg, 'Service.PuppeteerService.doStep', error)
      );

      throw new CustomError(error, 'PuppeteerService', 'doStep', msg);
    }
  }

  async waitAndClick(selector: string) {
    try {
      this.loggerService.log(
        new LoggerMessage('Wait And Click', 'Service.PuppeteerService.waitAndClick', { selector })
      );

      await this.page.waitForSelector(selector);

      await this.page.click(selector);
    } catch (error) {
      const msg = 'Selector not accessible';

      this.loggerService.error(
        new LoggerMessage(msg, 'Service.PuppeteerService.waitAndClick', error)
      );

      throw new CustomError(error, 'PuppeteerService', 'waitAndClick', msg, { selector });
    }
  }

  async waitAndType(selector: string, text: string) {
    try {
      this.loggerService.log(
        new LoggerMessage('Wait And Type', 'Service.PuppeteerService.waitAndType', { selector, text })
      );

      await this.page.waitForSelector(selector);

      await this.page.type(selector, await this._parseText(text));
    } catch (error) {
      const msg = 'Cannot write in the selector';

      this.loggerService.error(
        new LoggerMessage(msg, 'Service.PuppeteerService.waitAndType', error)
      );

      throw new CustomError(error, 'PuppeteerService', 'waitAndType', msg, { selector, text });
    }
  }

  async waitAndGetText(selector: string) {
    try {
      this.loggerService.log(
        new LoggerMessage('Wait And Get Text', 'Service.PuppeteerService.waitAndGetText', { selector })
      );

      await this.page.waitForSelector(selector);

      return await this.page.$eval(selector, el => el.innerHTML);
    } catch (error) {
      const msg = 'Unable to obtain selector text';

      this.loggerService.error(
        new LoggerMessage(msg, 'Service.PuppeteerService.waitAndGetText', error)
      );

      throw new CustomError(error, 'PuppeteerService', 'waitAndGetText', msg, { selector });
    }
  }

  async waitAndGetCount(selector: string) {
    try {
      this.loggerService.log(
        new LoggerMessage('Wait And Get Count', 'Service.PuppeteerService.waitAndGetCount', { selector })
      );

      await this.page.waitForSelector(selector);

      return await this.page.$$eval(selector, el => el.length);
    } catch (error) {
      const msg = 'Could not get count from selector';

      this.loggerService.error(
        new LoggerMessage(msg, 'Service.PuppeteerService.waitAndGetCount', error)
      );

      throw new CustomError(error, 'PuppeteerService', 'waitAndGetCount', msg, { selector });
    }
  }

  async waitAndGetElementByXPath(selector: string, returnAs: string) {
    try {
      this.loggerService.log(
        new LoggerMessage('Wait And Get Element By XPath', 'Service.PuppeteerService.waitAndGetElementByXPath', { selector, returnAs })
      );

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
      const msg = 'Could not get content from selector';

      this.loggerService.error(
        new LoggerMessage(msg, 'Service.PuppeteerService.waitAndGetElementByXPath', error)
      );

      throw new CustomError(error, 'PuppeteerService', 'waitAndGetElementByXPath', msg, { selector });
    }
  }

  async waitAndEvaluate(selector: string, returnAs: string) {
    try {
      this.loggerService.log(
        new LoggerMessage('Wait And Evaluate', 'Service.PuppeteerService.waitAndEvaluate', { selector, returnAs })
      );

      await this.page.waitForSelector(selector);

      const classList = await this.page.evaluate((selector: string) => {
        return [...document.querySelector(selector).classList]
      }, selector);

      this.result[returnAs] = classList;

      return;
    } catch (error) {
      const msg = 'Could not evaluate selector';

      this.loggerService.error(
        new LoggerMessage(msg, 'Service.PuppeteerService.waitAndEvaluate', error)
      );

      throw new CustomError(error, 'PuppeteerService', 'waitAndEvaluate', msg, { selector });
    }
  }

  private async _prepareAndDoRequest(selector: string, returnAs: string) {
    try {
      this.loggerService.log(
        new LoggerMessage('Prepare And Do Request', 'Service.PuppeteerService._prepareAndDoRequest', { selector, returnAs })
      );

      switch (selector) {
        case 'holded':
          const month = DateTime.local().setZone('Europe/Madrid').toFormat('L');
          const year = DateTime.local().setZone('Europe/Madrid').toFormat('y');

          this.result[returnAs] = await this.holdedService.getHolidaysList(month, year, this.cookies);

          break;

        default:
          throw new CustomError(null, 'PuppeteerService', '_prepareAndDoRequest', 'Service not implemented', { service: selector });
      }

      return;
    }
    catch (error) {
      const msg = 'The request could not be made';

      this.loggerService.error(
        new LoggerMessage(msg, 'Service.PuppeteerService._prepareAndDoRequest', error)
      );

      throw new CustomError(error, 'PuppeteerService', '_prepareAndDoRequest');
    }
  }

  private async _prepareAndNotify(channel: string) {
    try {
      this.loggerService.log(
        new LoggerMessage('Prepare And Notify', 'Service.PuppeteerService._prepareAndNotify', { channel })
      );

      const currentDate = DateTime.local().setZone('Europe/Madrid').toFormat('FFF');
      const filename = `${this.credentials.username}-${currentDate}-${this.result.action}`;

      const _notificationService = new Notification(notificationFactory(channel, this.configService, this.loggerService));

      await _notificationService.sendNotification({
        filename,
        base64string: this.result.base64string
      });

      return;
    }
    catch (error) {
      const msg = 'Channel not implemented';

      this.loggerService.error(
        new LoggerMessage(msg, 'Service.PuppeteerService._prepareAndNotify', error)
      );

      throw new CustomError(error, 'PuppeteerService', '_prepareAndNotify', msg, { channel });
    }
  }

  async _takeScreenshot(opts) {
    try {
      this.loggerService.log(
        new LoggerMessage('Take Screenshot', 'Service.PuppeteerService._prepareAndNotify', { opts })
      );

      this.result[opts.returnAs] = await this.page.screenshot({
        encoding: opts.encoding,
        fullPage: true,
      }) as string;
    }
    catch (error) {
      const msg = 'Could not take screenshot';

      this.loggerService.error(
        new LoggerMessage(msg, 'Service.PuppeteerService._prepareAndNotify', error)
      );

      throw new CustomError(error, 'PuppeteerService', '_takeScreenshot', msg, { opts });
    }
  }

  async _parseText(text: string): Promise<string> {
    try {
      this.loggerService.log(
        new LoggerMessage('Parse Text', 'Service.PuppeteerService._prepareAndNotify', { text })
      );

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
      const msg = 'Text cannot be transformed';

      this.loggerService.error(
        new LoggerMessage(msg, 'Service.PuppeteerService._prepareAndNotify', error)
      );

      throw new CustomError(error, 'PuppeteerService', '_parseText', msg, { text });
    }
  }

  async getDomainCookies(selectors: string): Promise<void> {
    try {
      this.loggerService.log(
        new LoggerMessage('Get Domain Cookies', 'Service.PuppeteerService._prepareAndNotify', { selectors })
      );

      // Get all cookies for make API call
      this.cookies = await this.page._client.send('Network.getAllCookies');

      this.processCookies(selectors);
      return;
    } catch (error) {
      const msg = 'Cookies could not be obtained';

      this.loggerService.error(
        new LoggerMessage(msg, 'Service.PuppeteerService._prepareAndNotify', error)
      );

      throw new CustomError(error, 'PuppeteerService', 'getDomainCookies', msg, { cookieNames: selectors });
    }
  }

  private processCookies(selectors: string): void {
    try {
      this.loggerService.log(
        new LoggerMessage('Process Cookies', 'Service.PuppeteerService.processCookies', { selectors })
      );

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

      return;
    }
    catch (error) {
      const msg = 'Cookies could not be processed';

      this.loggerService.error(
        new LoggerMessage(msg, 'Service.PuppeteerService.processCookies', error)
      );

      throw new CustomError(error, 'PuppeteerService', 'processCookies', msg, { selectors });
    }
  }
}
