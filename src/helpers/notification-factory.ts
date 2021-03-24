import { EChannel } from "@shared/enum/channel.enum";
import { CustomError } from "@shared/error/models/custom-error.class";
import { ConfigService } from "src/config/services/config.service";
import { INotification } from "src/interfaces/notification.interface";
import { DiscordService } from "src/services/discord/discord.service";

export function notificationFactory(channel: string, configService: ConfigService): INotification {
  switch (channel) {
    case EChannel.DISCORD:
      return new DiscordService(configService);
    default:
      throw new CustomError(null, 'Helper', 'notificationFactory', 'Channel not implemented', { channel });
  }
}
