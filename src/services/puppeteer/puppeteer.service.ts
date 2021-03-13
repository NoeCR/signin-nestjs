import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PuppeteerService {
  private page: any;

  constructor() {
    this.page = null;
  }

  async startUp() {
    try {
      const browser = await puppeteer.launch({
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

      this.page = await browser.newPage();

      return;
    } catch (error) {
      throw new Error('Start UP failed!')
    }
  }

  async goTo(url: string): Promise<void> {
    try {
      await this.page.goto(url);
    } catch (error) {
      throw new Error(`Error`)
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
