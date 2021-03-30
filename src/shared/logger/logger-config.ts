import { WinstonModuleOptions } from "nest-winston";
import { ConfigService } from "src/config/services/config.service";
import * as Transport from "winston-transport";
import * as Winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston/dist/winston.utilities';
import { EConfiguration } from "src/config/enum/config-keys.enum";
import { EEnvironment } from "@shared/enum/environments.enum";
import { ElasticsearchTransport } from "winston-elasticsearch";

export class LoggerConfigImport {
  static defaultTransport(): Transport {
    return new Winston.transports.Console({
      level: 'debug',
      format: Winston.format.combine(
        Winston.format.timestamp(),
        nestWinstonModuleUtilities.format.nestLike()
      )
    });
  }

  static elasticSearchTransport(): Transport {
    return new ElasticsearchTransport({
      apm: null,
      level: 'debug',
      indexPrefix: 'signin',
      format: Winston.format.json(),
      clientOpts: {
        node: 'http://localhost:9200',
        auth: {
          username: 'elastic',
          password: 'changeme'
        }

      },

    });
  }

  static asyncConfig(configService: ConfigService): WinstonModuleOptions {
    const transports: Transport[] = [];

    transports.push(LoggerConfigImport.defaultTransport());
    console.log('asyncConfig ', configService.get(EConfiguration.NODE_ENV));
    console.log('asyncConfig ', configService.get(EConfiguration.NODE_ENV) === EEnvironment.TEST);
    if (configService.get(EConfiguration.NODE_ENV) === EEnvironment.TEST) {
      transports.push(LoggerConfigImport.elasticSearchTransport());
    }

    return {
      level: 'verbose',
      transports,
      defaultMeta: {
        service: process.env.npm_package_name
      }
    };
  }
}