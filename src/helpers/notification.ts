import { IMessage } from 'src/interfaces/message.insterface';
import { INotification } from 'src/interfaces/notification.interface';

export class Notification {
  constructor(private _notificationService: INotification) { }

  sendNotification(message: IMessage): void {
    return this._notificationService.send(message);
  }
}
