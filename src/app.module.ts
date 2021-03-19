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
  providers: [CronService, PuppeteerService, CryptoService, TaskRunner, HoldedService],
})
export class AppModule {
  static port: number | string;

  constructor(private readonly _configService: ConfigService) {
    AppModule.port = this._configService.get(EConfiguration.PORT)
  }
}
