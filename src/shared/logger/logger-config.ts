import { WinstonModuleOptions } from "nest-winston";
import { ConfigService } from "src/config/services/config.service";
import * as Transport from "winston-transport";
import * as Winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston/dist/winston.utilities';
import { EConfiguration } from "src/config/enum/config-keys.enum";
import { EEnvironment } from "@shared/enum/environments.enum";
import { ElasticsearchTransport } from "winston-elasticsearch";
import * as APM from 'elastic-apm-node';
import { ApmService } from "@shared/apm/apm.service";

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

  static elasticSearchTransport(APM): Transport {
    return new ElasticsearchTransport({
      // apm: APM,
      // APM.start({
      //   serviceName: 'signin',
      //   serverUrl: 'http://localhost:8200',
      //   active: true,
      //   captureBody: 'all',
      //   frameworkName: 'NestJS',
      //   logLevel: 'info',
      //   environment: 'production'
      // }),
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

  static asyncConfig(configService: ConfigService, apmService: ApmService): WinstonModuleOptions {
    const transports: Transport[] = [];

    transports.push(LoggerConfigImport.defaultTransport());
    console.log('asyncConfig ', configService.get(EConfiguration.NODE_ENV));
    console.log('asyncConfig ', configService.get(EConfiguration.NODE_ENV) === EEnvironment.TEST);
    if (configService.get(EConfiguration.NODE_ENV) === EEnvironment.TEST) {
      transports.push(LoggerConfigImport.elasticSearchTransport(apmService));
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