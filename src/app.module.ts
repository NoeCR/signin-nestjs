import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskRunner } from './helpers/task-runner';
import { CronService } from './services/cron/cron.service';
// import { PuppeteerModule } from 'nest-puppeteer';
import { PuppeteerService } from './services/puppeteer/puppeteer.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    // PuppeteerModule.forRoot({ pipe: true }),
  ],
  controllers: [],
  providers: [CronService, PuppeteerService, TaskRunner],
})
export class AppModule {}
