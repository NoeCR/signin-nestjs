import { HttpModule, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/services/config.service';
import { EConfiguration } from './config/enum/config-keys.enum';

import { TaskRunner } from './helpers/task-runner';

// Services
import { PuppeteerService } from './services/puppeteer/puppeteer.service';
import { CronService } from './services/cron/cron.service';
import { CryptoService } from './services/crypto/crypto.service';
import { HoldedService } from './services/holded/holded.service';
import { Notification } from './helpers/notification';
import { DiscordService } from './services/discord/discord.service';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './error/exceptions.filter';

const SERVICES = [
  CronService,
  PuppeteerService,
  CryptoService,
  TaskRunner,
  HoldedService,
  Notification,
  DiscordService,
];
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [],
  providers: [
    AllExceptionsFilter,
    ...SERVICES,
  ],
})
export class AppModule {
  static port: number | string;

  constructor(private readonly _configService: ConfigService) {
    AppModule.port = this._configService.get(EConfiguration.PORT)
  }
}
