import { Time } from "@shared/types/time.type";
import { ITask } from "src/interfaces/task.interface";
import { DateTime } from 'luxon';
import { IRunTask } from "src/interfaces/run-task.interface";
import { EHoldedButtons } from "@shared/enum/holded-buttons.enum";
import { ETimeControlAction } from "@shared/enum/time-control-action.enum";

export function shouldRunTask(task: ITask, time: Time): IRunTask {
  console.log('mustRunTask ',);
  const isTime = task.signin.includes(time) || task.signout.includes(time);
  console.log('mustRunTask ', isTime)
  return {
    // isTime: task.signin.includes(time) || task.signout.includes(time),
    isTime: true, // TODO: Only for test
    action: task.signin.includes(time) ? ETimeControlAction.SIGNIN : ETimeControlAction.SIGNOUT
  };
}

export function shouldExecuteTask(validationData: any, selectors: string): boolean {
  const requiredKeys = selectors.split(',');

  if (!requiredKeys.every(key => validationData.hasOwnProperty(key)))
    throw new Error(`Required keys: ${requiredKeys} not founded`);

  const { list, userInfo, visibleButtonClassList, action } = validationData;
  console.log('shouldExecuteTask ', visibleButtonClassList, action);
  const userData = _extractUserData(userInfo);

  if (!_isWorkingDay(userData.workingDays)) return false;

  if (_isFreeDay(userData, list)) return false;

  if (!_isActionRequired(visibleButtonClassList, action)) return false;
  console.log('shouldExecuteTask TRUE!!');
  return true; // TODO: Only for test
}

function _extractUserData(userInfo: Array<string>) {
  const userData = { workingDays: '', workplace: '', employee: '' };

  userInfo.map(info => {
    if (info.startsWith(userInfoKeys.WORKINGDAYS)) {
      const [, value] = info.split(':');
      userData.workingDays = value.trim();
    }

    if (info.startsWith(userInfoKeys.WORKPLACE)) {
      const [, value] = info.split(':');
      userData.workplace = value.trim();
    }

    if (info.startsWith(userInfoKeys.EMPLOYEE)) {
      const [, value] = info.split(':');
      userData.employee = value.trim();
    }
  });

  return userData;
}

function _isWorkingDay(workingDays: string) {
  const abbreviatedCurrentDay = DateTime.local().setZone('Europe/Madrid').toFormat('ccc').toUpperCase();
  // console.log('_isWorkingDay - currentDay', abbreviatedCurrentDay);
  // console.log('_isWorkingDay - workingdays', workingDays.split(','));
  // console.log('_isWorkingDay ', workingDays.split(',').some(day => day.toUpperCase() === abbreviatedCurrentDay));
  return workingDays.split(',').some(day => day.trim().toUpperCase() === abbreviatedCurrentDay);
}

function _isFreeDay(userData: { workingDays: string; workplace: string; employee: string; }, list: any) {
  const freeDays = [
    list[`workplace#${userData.workplace}`],
    list[`employee#${userData.employee}`],
  ]
    .filter(el => el !== undefined)
    .reduce((acc, current) => acc.concat(current), []);

  if (!freeDays.length) return false

  const currentDayOfMonth = DateTime.local().setZone('Europe/Madrid').toFormat('dd').toUpperCase();

  return freeDays.some(freeDay => (freeDay.date === currentDayOfMonth && freeDay.status === 'accepted'));
}

function _isActionRequired(visibleButtonClassList, action): boolean {
  console.log('_isActionRequired ', visibleButtonClassList, action);
  const requiredAction = visibleButtonClassList
    .includes(EHoldedButtons.BTN_LOCK_IN)
    ? ETimeControlAction.SIGNOUT
    : ETimeControlAction.SIGNIN;
  console.log('_isActionRequired - requiredAction ', requiredAction);
  return requiredAction === action;
}

const userInfoKeys = {
  WORKPLACE: 'data-workplace',
  WORKINGDAYS: 'data-workingdays',
  EMPLOYEE: 'data-employee',
}






