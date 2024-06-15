import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { throwError } from 'rxjs';

@Catch()
export class RpcExceptionsFilter implements ExceptionFilter {
  constructor() {}

  catch(exception: any, host: ArgumentsHost): any {
    try {
      if (exception.error) {
        return throwError(() => exception);
      }

      const response = exception.getResponse();
      const status = exception.getStatus() ?? HttpStatus.BAD_REQUEST;
      return throwError(
        () =>
          new RpcException({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: host.switchToHttp().getRequest().url,
            error: typeof response === 'string' ? response : response.error,
            message: typeof response === 'string' ? response : response.message,
          }),
      );
    } catch (e) {
      console.log('RpcExceptionsFilter -> catch -> e', e);
      return throwError(() => new RpcException(exception));
    }
  }
}
