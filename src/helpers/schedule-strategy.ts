import { ESchedule } from "@shared/enum/schedule.enum";
import { CustomError } from "@shared/error/models/custom-error.class";
import { EConfiguration } from "src/config/enum/config-keys.enum";
import { ConfigService } from "src/config/services/config.service";
import { ScheduleComplete } from "src/models/schedule-complete.class";
import { ScheduleReduced } from "src/models/schedule-reduced.class";
import { Schedule } from "src/models/schedule.class";

export function scheduleStrategy(configService: ConfigService): Schedule {
  switch (configService.get(EConfiguration.SCHEDULE)) {
    case ESchedule.COMPLETE:
      return new ScheduleComplete(configService);
    case ESchedule.REDUCED:
      return new ScheduleReduced(configService);
    default:
      throw new CustomError(null, 'Helper', 'scheduleStrategy', 'Schedule not implemented', { schedule: configService.get(EConfiguration.SCHEDULE) });
  }
}
