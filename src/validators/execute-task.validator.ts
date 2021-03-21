import { Time } from "@shared/types/time.type";
import { ITask } from "src/interfaces/task.interface";
import { DateTime } from 'luxon';

export function shouldRunTask(task: ITask, time: Time): boolean {
  console.log('mustRunTask ',);
  const isTime = task.signin.includes(time) || task.signout.includes(time);
  console.log('mustRunTask ', isTime)
  return true; // TODO: Only for test
}

export function shouldExecuteTask(validationData: any, selectors: string): boolean {
  // let execute = true;
  const requiredKeys = selectors.split(',');
  console.log(requiredKeys);
  if (!requiredKeys.every(key => validationData.hasOwnProperty(key)))
    throw new Error(`Required keys: ${requiredKeys} not founded`);

  const { list, userInfo } = validationData;
  // console.log('mustExecuteTask ', list, userInfo);
  const userData = _extractUserData(userInfo);
  console.log('mustExecuteTask - userData ', userData);
  if (!_isWorkingDay(userData.workingDays)) return false;

  if (_isFreeDay(userData, list)) return false;

  // console.log('mustRunTask ', isTime)
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
  console.log('_isWorkingDay - currentDay', abbreviatedCurrentDay);
  console.log('_isWorkingDay - workingdays', workingDays.split(','));
  console.log('_isWorkingDay ', workingDays.split(',').some(day => day.toUpperCase() === abbreviatedCurrentDay));
  return workingDays.split(',').some(day => day.trim().toUpperCase() === abbreviatedCurrentDay);
}

function _isFreeDay(userData: { workingDays: string; workplace: string; employee: string; }, list: any) {
  console.log('_isFreeDay Start! ')
  console.log('_isFreeDay workplace ', `workplace#${userData.workplace}`)
  console.log('_isFreeDay employee ', `employee#${userData.employee}`)
  console.log(list[`workplace#${userData.workplace}`])
  console.log(list[`employee#${userData.employee}`])
  const freeDays = [
    list[`workplace#${userData.workplace}`],
    list[`employee#${userData.employee}`],
  ]
    .filter(el => el !== undefined)
    .reduce((acc, current) => acc.concat(current), []);
  console.log('_isFreeDay - freeDays ', freeDays);
  if (!freeDays.length) return false

  const currentDayOfMonth = DateTime.local().setZone('Europe/Madrid').toFormat('dd').toUpperCase();
  console.log('_isFreeDay - currentDayOfMonth ', currentDayOfMonth);
  console.log('_isFreeDay - result ', freeDays.some(freeDay => (freeDay.date === currentDayOfMonth && freeDay.status === 'accepted')));
  return freeDays.some(freeDay => (freeDay.date === currentDayOfMonth && freeDay.status === 'accepted'));
}

const userInfoKeys = {
  WORKPLACE: 'data-workplace',
  WORKINGDAYS: 'data-workingdays',
  EMPLOYEE: 'data-employee',
}




