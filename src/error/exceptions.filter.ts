import { Catch, ArgumentsHost, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {

  catch(exception: unknown, host: ArgumentsHost) {
    console.log('AllExceptionsFilter ');
    // console.log('AllExceptionsFilter - exception ', exception);
    console.log('AllExceptionsFilter - exception ', typeof exception);
    if (exception instanceof Error) {
      console.log('AllExceptionsFilter - exception ', JSON.parse(exception.message));
      const errorObj = JSON.parse(exception.message);
      console.log('AllExceptionsFilter - exception ', errorObj);
    }



    if (exception instanceof HttpException) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();
      const status = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;

      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
    else {
      console.log('SEND NOTIFICATION')
    }
  }
}
