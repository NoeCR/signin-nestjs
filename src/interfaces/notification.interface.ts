import { IMessage } from "./message.insterface";

export interface INotification {
  send(message: IMessage): void;
}