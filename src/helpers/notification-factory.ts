import { EChannel } from "@shared/enum/channel.enum";
import { CustomError } from "@shared/error/models/custom-error.class";
import { ConfigService } from "src/config/services/config.service";
import { INotification } from "src/interfaces/notification.interface";

export function notificationFactory(channel: string, configService: ConfigService): Promise<INotification> {
  const DiscordPath = "src/services/discord/discord.service";
  switch (channel) {
    case EChannel.DISCORD:
      return import(DiscordPath).then( DiscordService => new DiscordService(configService));
    default:
      throw new CustomError(null, 'Helper', 'notificationFactory', 'Channel not implemented', { channel });
  }
}
