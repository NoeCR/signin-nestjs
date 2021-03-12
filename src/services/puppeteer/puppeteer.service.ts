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
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ]
      });

      this.page = await browser.newPage();

      return;
    } catch (ex) {
      throw new Error('Start UP failed!')
    }
  }

  async goTo (url: string): Promise<void> {
    try {
      await this.page.goto(url);
    } catch (ex) {
      throw new Error(`Error`)
    }
  }

  async typeText(selector, text) {
    try {
      await this.page.waitForSelector(selector)
      await this.page.type(selector, text)
    } catch (ex) {
      throw new Error(`Could not type '${text}', into selector: ${selector}`)
    }
  }
}
