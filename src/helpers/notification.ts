import { CustomError } from '@shared/error/models/custom-error.class';
import { IMessage } from 'src/interfaces/message.insterface';
import { INotification } from 'src/interfaces/notification.interface';

export class Notification {
  constructor(private _notificationService: INotification) { }

  sendNotification(message: IMessage): void {
    return this._notificationService.send(message);
  }

  sendErrorNotification(error: CustomError): void {
    return this._notificationService.sendErrorMessage(error);
  }
}
