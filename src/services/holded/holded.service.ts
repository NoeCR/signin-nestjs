import { HttpService, Injectable, LoggerService } from '@nestjs/common';
import { CustomError } from '@shared/error/models/custom-error.class';
import { LoggerMessage } from '@shared/logger/models/logger-message.class';
import { EConfiguration } from 'src/config/enum/config-keys.enum';
import { ConfigService } from 'src/config/services/config.service';
import { IDomainCookies } from 'src/interfaces/domain-cookies.interface';

@Injectable()
export class HoldedService {
  private httpHeaders: object;
  constructor(
    private httpService: HttpService,
    private readonly configService: ConfigService,
    // private readonly loggerService: LoggerService,
  ) { }

  getHolidaysList(month: string, year: string, cookies: IDomainCookies): Promise<any> {
    const baseUrl = this.configService.get(EConfiguration.BASE_URL);
    const path = this.configService.get(EConfiguration.LIST_PATH);

    this.setCookies(cookies);

    // this.loggerService.log(
    //   new LoggerMessage('', 'Service.DiscordService.sendErrorMessage', { month, year, baseUrl, path, headers: this.httpHeaders })
    // );

    return this.httpService
      .post(`${baseUrl}${path}${month}/${year}`, null, { headers: this.httpHeaders })
      .toPromise()
      .then(result => result.data.list)
      .catch(error => {
        const msg = 'The list of days off for the month and year could not be obtained.';

        // this.loggerService.error(
        //   new LoggerMessage(msg, 'Service.DiscordService.sendErrorMessage', { error })
        // );

        new CustomError(error, 'HoldedService', 'getHolidaysList', msg, { month, year });
      });
  }

  /**
   *
   * @param {IDomainCookies} cookies Cookies filtered
   * @example 'Cookie: lang=es; __cfduid=d3d796f2d8f0caadb9accf7d2efdc5dc41615662227; PHPSESSID=05bd4e94d70529394945ca716f9e8034'
   */
  private setCookies(cookies: IDomainCookies) {
    let cookieHeader = 'lang=es; '

    for (const cookie of cookies.cookies) {
      cookieHeader += `${cookie.name}=${cookie.value}; `;
    }

    this.httpHeaders = {
      Cookie: cookieHeader.trim()
    }
  }
}
