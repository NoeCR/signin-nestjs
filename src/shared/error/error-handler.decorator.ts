import { Inject } from "@nestjs/common";
import { EConfiguration } from "src/config/enum/config-keys.enum";
import { ConfigService } from "src/config/services/config.service";
import { Notification } from '../../helpers/notification';
import { notificationFactory } from "src/helpers/notification-factory";

export function ErrorHandler(report = true) {
  const injectConfig = Inject(ConfigService);

  return (target: any, propertyKey: string, propertyDescriptor: PropertyDescriptor) => {
    injectConfig(target, 'configService');

    //get original method
    const originalMethod = propertyDescriptor.value;

    //redefine descriptor value within own function block
    propertyDescriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      }
      catch (error) {
        if (report) {
          const configService: ConfigService = this.configService;
          const channel = configService.get(EConfiguration.DEFAULT_CHANNEL);

          const _notificationService = new Notification(await notificationFactory(channel, configService));

          await _notificationService.sendErrorNotification(error);
        }
      }
    };
  };
}