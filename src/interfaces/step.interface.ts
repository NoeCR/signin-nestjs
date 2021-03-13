export interface IStep {
  action: string;
  selector: string;
  text?: string;
  waitForNavigation?: boolean;
}