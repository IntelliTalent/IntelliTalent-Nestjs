import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class  implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      catchError((exception) => {

        if (exception instanceof RpcException) {
          // If the exception is already an object response, rethrow it
          throw exception;
        }

        throw new RpcException({
          statusCode: exception.getStatus(),
          message: exception.getResponse(),
        });
      }),
    );
  }
}
