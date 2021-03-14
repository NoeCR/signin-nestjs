import { Time } from "@shared/types/time.type";
import { ITask } from "src/interfaces/task.interface";

export function mustRunTask(task: ITask, time: Time): boolean {
  console.log('mustRunTask ',);
  const isTime = task.signin.includes(time) || task.signout.includes(time);
  console.log('mustRunTask ', isTime)
  return true; // TODO: Only for test
}