import { CustomError } from "@shared/error/models/custom-error.class";
import { IMessage } from "./message.insterface";

export interface INotification {
  send(message: IMessage): void;
  sendErrorMessage(error: CustomError): void;
}