import { EWeekDays } from "@shared/enum/week-days.enum";
import { EConfiguration } from "src/config/enum/config-keys.enum";
import { ConfigService } from "src/config/services/config.service";
import { ITask } from "src/interfaces/task.interface";

export abstract class Schedule {
  constructor(private readonly _configService: ConfigService) { }

  abstract getScheduledTask(): ITask;

  getAuthenticationCredentials() {
    return {
      url: this._configService.get(EConfiguration.BASE_URL),
      username: this._configService.get(EConfiguration.USERNAME),
      password: this._configService.get(EConfiguration.PASSWORD),
      userId: this._configService.get(EConfiguration.USER_ID),
    }
  }

  getEnabledDays() {
    return {
      enableDays: [
        EWeekDays.MONDAY,
        EWeekDays.TUESDAY,
        EWeekDays.WEDNESDAY,
        EWeekDays.THURSDAY,
        EWeekDays.FRIDAY,
      ],
    }
  }
}