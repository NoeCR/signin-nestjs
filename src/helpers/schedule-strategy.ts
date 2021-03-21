import { ESchedule } from "@shared/enum/schedule.enum";
import { EConfiguration } from "src/config/enum/config-keys.enum";
import { ConfigService } from "src/config/services/config.service";
import { ScheduleComplete } from "src/models/schedule-complete.class";
import { ScheduleReduced } from "src/models/schedule-reduced.class";
import { Schedule } from "src/models/schedule.class";

export function scheduleStrategy(configService: ConfigService): Schedule {
  // console.log('scheduleStrategy ', configService.get(EConfiguration.SCHEDULE))
  switch (configService.get(EConfiguration.SCHEDULE)) {
    case ESchedule.COMPLETE:
      return new ScheduleComplete(configService);
    case ESchedule.REDUCED:
      return new ScheduleReduced(configService);
    default:
      throw new Error('Schedule not implemented');
  }
}
