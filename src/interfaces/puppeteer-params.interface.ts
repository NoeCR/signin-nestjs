import { ICredentials } from "./credentials.interface";

export interface IPuppeteerParams extends ICredentials {
  action: string;
}