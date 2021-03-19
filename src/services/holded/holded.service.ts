import { HttpService, Injectable } from '@nestjs/common';
import { EConfiguration } from 'src/config/enum/config-keys.enum';
import { ConfigService } from 'src/config/services/config.service';
import { IDomainCookies } from 'src/interfaces/domain-cookies.interface';

@Injectable()
export class HoldedService {
  private httpHeaders: object;
  constructor(
    private httpService: HttpService,
    private readonly _configService: ConfigService,
  ) { }

  getHolidaysList(month: string, year: string, cookies: IDomainCookies): Promise<any> {
    const baseUrl = this._configService.get(EConfiguration.BASE_URL);
    const path = this._configService.get(EConfiguration.LIST_PATH);

    this.setCookies(cookies);

    console.log('getHolidaysList ', `${baseUrl}${path}${month}/${year}`);
    return this.httpService
      .post(`${baseUrl}${path}${month}/${year}`, null, { headers: this.httpHeaders })
      .toPromise();
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
