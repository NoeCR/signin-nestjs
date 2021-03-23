import { EAction } from "@shared/enum/action.enum";
import { ITask } from "src/interfaces/task.interface";
import { Schedule } from "./schedule.class";

export class ScheduleReduced extends Schedule {
  getScheduledTask(): ITask {
    return {
      ...this.getAuthenticationCredentials(),
      ...this.getEnabledDays(),
      signin: '08:00',
      signout: '15:00',
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
        {
          action: EAction.COOKIES,
          selector: '__cfduid,PHPSESSID', // This selector is the names of the cookies to be processed.
        },
        {
          action: EAction.REQUEST,
          selector: 'holded',
          returnAs: 'list'
        },
        {
          action: EAction.NAVIGATE,
          selector: 'calendar'
        },
        {
          action: EAction.XPATH,
          selector: '{USER_ID}',
          returnAs: 'userInfo'
        },
        {
          action: EAction.NAVIGATE,
          selector: 'home'
        },
        {
          action: EAction.EVALUATE,
          selector: 'button.ocult',
          returnAs: 'visibleButtonClassList'
        },
        {
          action: EAction.VALIDATE,
          selector: 'list,userInfo,visibleButtonClassList,action',
          returnAs: 'execute'
        },
        {
          action: EAction.CLICK,
          selector: 'visibleButtonClassList'
        },
        {
          action: EAction.TAKE_SCREENSHOT,
          selector: 'base64',
          returnAs: 'base64string'
        },
        {
          action: EAction.NOTIFY,
          selector: 'discord',
        },
      ]
    }
  }
}