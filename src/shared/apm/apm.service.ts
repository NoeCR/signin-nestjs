import { Injectable } from '@nestjs/common';
import * as APM from 'elastic-apm-node';

@Injectable()
export class ApmService {
  apm: any;

  constructor() { // APM_OPTIONS
    // this.apm = APM.isStarted() ? APM : APM.start({
    //   serviceName: '',
    //   secretToken: '',
    //   serverUrl: 'http://localhost:8200'
    // });
    this.apm = APM.isStarted() ? APM : APM.start({
      serviceName: 'signin',
      serverUrl: 'http://localhost:8200',
      active: true,
      captureBody: 'all',
      frameworkName: 'NestJS',
      logLevel: 'info',
      environment: 'production'
    });

    return this.apm;
  }

  captureError(data: any) {
    return this.apm.captureError(data);
  }

  startTransaction(name, type): any {
    return this.apm.startTransaction(name, type);
  }

  setTransactionName(name) {
    return this.apm.setTransactionName(name);
  }

  startSpan(name) {
    return this.apm.startSpan(name);
  }
}


