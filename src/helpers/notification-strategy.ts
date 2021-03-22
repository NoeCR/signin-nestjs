import { EChannel } from "@shared/enum/channel.enum";
import { ConfigService } from "src/config/services/config.service";
import { INotification } from "src/interfaces/notification.interface";
import { DiscordService } from "src/services/discord/discord.service";

export function notificationStrategy(channel: string, configService: ConfigService): INotification {
  switch (channel) {
    case EChannel.DISCORD:
      return new DiscordService(configService);
    default:
      throw new Error('Channel not implemented');
  }
}
