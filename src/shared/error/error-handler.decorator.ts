import { Inject } from "@nestjs/common";
import { EConfiguration } from "src/config/enum/config-keys.enum";
import { ConfigService } from "src/config/services/config.service";
import { Notification } from '../../helpers/notification';
import { notificationFactory } from "src/helpers/notification-factory";
import { LoggerService } from "@shared/logger/logger.service";

export function ErrorHandler(report = true) {
  const injectConfig = Inject(ConfigService);
  const injectLogger = Inject(LoggerService);

  return (target: any, propertyKey: string, propertyDescriptor: PropertyDescriptor) => {
    injectConfig(target, 'configService');
    injectLogger(target, 'loggerService');

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
          const loggerService: LoggerService = this.loggerService;
          const channel = configService.get(EConfiguration.DEFAULT_CHANNEL);

          const _notificationService = new Notification(notificationFactory(channel, configService, loggerService));

          await _notificationService.sendErrorNotification(error);
        }
      }
    };
  };
}