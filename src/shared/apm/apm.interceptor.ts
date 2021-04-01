import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { LoggerService } from "@shared/logger/logger.service";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { ApmService } from "./apm.service";

@Injectable()
export class ApmInterceptor implements NestInterceptor {
  constructor(private readonly apmService: ApmService, private readonly loggerService: LoggerService) { }

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const [IncomingMessage, ...res] = context.getArgs();

    this.apmService.setTransactionName(`${IncomingMessage.method} ${IncomingMessage.url}`);

    return next
      .handle()
      .pipe(
        tap(() => this.loggerService.log),
      );
  }
}