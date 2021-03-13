import { IStep } from "./step.interface";

export class ITask {
  time: Date;
  action: string;
  url: string;
  username: string;
  password: string;
  loginSteps: Array<IStep>;
  jobSteps: Array<IStep>;
}