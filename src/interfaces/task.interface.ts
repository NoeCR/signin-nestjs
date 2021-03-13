import { EWeekDays } from "@shared/enum/week-days.enum";
import { Time } from "@shared/types/time.type";
import { IStep } from "./step.interface";

export class ITask {
  url: string;
  username: string;
  password: string;
  enableDays: Array<EWeekDays>;
  signin: Time | Time[];
  signout: Time | Time[];
  loginSteps: Array<IStep>;
  jobSteps: Array<IStep>;
}