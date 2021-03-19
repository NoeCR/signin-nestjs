import { EAction } from "@shared/enum/action.enum";
import { ITask } from "src/interfaces/task.interface";
import { Schedule } from "./schedule.class";

export class ScheduleComplete extends Schedule {
  // TODO: Complete loginSteps and jobSteps
  getScheduledTask(): ITask {
    return {
      ...this.getAuthenticationCredentials(),
      ...this.getEnabledDays(),
      signin: ['08:00', '15:00'],
      signout: ['14:00', '17:00'],
      loginSteps: [
        {
          action: EAction.TYPE,
          selector: '#tpemail',
          text: '{USERNAME}'
        },
        {
          action: EAction.TYPE,
          selector: '#tppassword',
          text: '{PASSWORD}'
        },
        {
          action: EAction.CLICK,
          selector: '#btnlogin',
        }
      ],
      jobSteps: [
        // TODO: First action depends if its signin or signout for check status of button
        // And do next action or close (if its stopped when try to signout, do nothing)
        {
          action: EAction.CLICK,
          selector: 'some selector here',
        }
      ]
    }
  }
}