import { EAction } from "@shared/enum/action.enum";

export interface IStep {
  action: EAction;
  selector: string;
  text?: string;
  returnAs?: string | number | boolean;
  waitForNavigation?: boolean;
}