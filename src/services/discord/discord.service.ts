import { ConfigService } from 'src/config/services/config.service';
import { IMessage } from 'src/interfaces/message.insterface';
import { INotification } from 'src/interfaces/notification.interface';
import * as Discord from 'discord.js';
import { EConfiguration } from 'src/config/enum/config-keys.enum';
import { CustomError } from '@shared/error/models/custom-error.class';

export class DiscordService implements INotification {
  discord_id: string;
  discord_token: string;

  constructor(private configService: ConfigService) {
    this.discord_id = this.configService.get(EConfiguration.DISCORD_ID);
    this.discord_token = this.configService.get(EConfiguration.DISCORD_TOKEN);
  }

  send(message: IMessage) {
    try {
      const Hook = new Discord.WebhookClient(this.discord_id, this.discord_token);

      const imageStream = Buffer.from(message.base64string, 'base64');
      const attachment = new Discord.MessageAttachment(imageStream);

      const embed = new Discord.MessageEmbed()
        .setTitle(message.filename)
        .setDescription(this.randomBenderMessages())
        .attachFiles([attachment]);

      Hook.send(embed);
    }
    catch (error) {
      throw new CustomError(error, 'DiscordService', 'send', 'Message could not be sent', { message });
    }
  }

  sendErrorMessage(message: CustomError) {
    // TODO: implemented method
  }

  randomBenderMessages(): string {
    const benderSentencesEsp = [
      'Y a pesar de que el ordenador estaba apagado y desenchufado, una imagen permanecía en la pantalla… era… ¡¡el control de fichaje!!',
      'Aquí tienes tu fichaje cacho carne',
      '¿Una robopilingui de trecientos pavos o trescientas robopilinguis de a dolar?, no me respondas solo ficha',
      'Tengo que dejar de fichar por gente. No soy lo suficientemente famoso como para librarme.',
      '¿Qué clase de fiesta es esta?, ¡No hay alcohol y sólo se ve un fichaje!',
      'Llevo un fichaje más que tú cacho carne.',
      'Fichaje realizado con mi brillante culo metálico.',
      'No. Yo no puedo votar por ser criminal convicto. Pero puedo fichar!',
      '¿Han probado alguna vez a apagar la tele, sentarse con sus empleados y darles una paliza?',
      'Dile a Don Bot (Capo de la mafia robótica)  que dejo el crimen organizado, a partir de ahora me dedicaré sólo al crimen normal',
      'Siempre quise saber si puedo fastidiar a la gente más de lo que la fastidio, ¿tal vez fichando a deshoras?',
      'de todos los amigos que he tenido, tú… eres el único',
      'Chantaje es una palabra muy fea, yo prefiero… extorsión, la X le da mucha clase',
      'La llevaré con orgullo y la empeñaré en cuanto pueda',
      'Comparad vuestras vidas con la mía… y luego podéis suicidaros'
    ];

    const selectedIndex = Math.floor(Math.random() * benderSentencesEsp.length);

    return benderSentencesEsp[selectedIndex];
  }
}