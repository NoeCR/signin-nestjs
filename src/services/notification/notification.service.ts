import { HttpService, Injectable } from '@nestjs/common';
import { EConfiguration } from 'src/config/enum/config-keys.enum';
import { ConfigService } from 'src/config/services/config.service';
import { INotificationMessage } from 'src/interfaces/notification-message.insterface';

@Injectable()
export class NotificationService {

  private allowedChannels = {
    DISCORD: 'discord'
  };

  constructor(private httpService: HttpService, private readonly _configService: ConfigService,) { }

  sendNotification(notification: INotificationMessage): Promise<any> {
    if (!Object.values(this.allowedChannels).some(channel => channel === notification.channel))
      throw new Error(`Channel ${notification.channel}, not implemented`);

    console.log('sendNotification ', notification.channel);
    switch (notification.channel) {
      case this.allowedChannels.DISCORD:
        const buffer: Buffer = Buffer.from(notification.base64string, "base64");
        this._sendByDiscord({
          // url: this._configService.get(EConfiguration.NOTIFICATION_WEB_HOOK),
          formData: {
            channels: 'reports',
            file: {
              value: buffer,
              options: {
                filename: notification.filename,
              }
            },
            filename: notification.filename,
            filetype: "image/png",
            // token: SLACK_API_TOKEN,
          }
        });
        // this._sendByDiscord({
        //   filename: notification.filename,
        //   data: notification.base64string,
        // });
        break;
      default:
        throw new Error(`Switched selected error ${notification.channel}`);
    }
    return;
  }

  _sendByDiscord(message): Promise<any> {
    return this.httpService
      .post(this._configService.get(EConfiguration.NOTIFICATION_WEB_HOOK), message, { headers: 'Content-Type: multipart/form-data' })
      .toPromise()
      .then(res => console.log('_sendByDiscord successfully', res))
      .catch(err => console.log('_sendByDiscord Error', err));
  }
}
