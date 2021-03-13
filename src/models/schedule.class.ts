import { ITask } from "src/interfaces/task.interface";

abstract class Schedule {
  constructor() { }

  abstract getScheduledTask(): ITask;
}