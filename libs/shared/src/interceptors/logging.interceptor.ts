import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';


/**
 * LoggingInterceptor is a custom interceptor implementing the NestInterceptor interface from NestJS.
 * It is used to log details about HTTP requests and responses.
 *
 *
 * intercept() - This method is required by the NestInterceptor interface. It intercepts the execution of a handler.
 * It returns an Observable.
 *
 * The intercept method does the following:
 * - Checks if the current context is an HTTP request. If it is, it logs the HTTP call.
 *
 * logHttpCall() - This private method logs details about an HTTP call.
 *
 * The logHttpCall method does the following:
 * - Retrieves the request object from the context.
 * - Retrieves various details from the request, such as the user agent, IP address, HTTP method, URL, and user ID.
 * - Generates a correlation key using the uuidv4 function.
 * - Logs the request details using the Logger object.
 * - Records the current time.
 * - Calls the handle() method of the next object in the interceptor chain. This returns an Observable.
 * - Pipes the Observable through the tap operator. This operator performs a side effect for every emission on the source Observable, but returns an Observable that is identical to the source.
 * - In the tap operator, it retrieves the response object from the context, retrieves various details from the response, such as the status code and content length, and logs the response details and the time taken to handle the request.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      return this.logHttpCall(context, next);
    }
  }

  private logHttpCall(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const userAgent = request.get('user-agent') || '';
    const { ip, method, path: url } = request;
    const correlationKey = uuidv4();
    const userId = request.user?.userId;

    this.logger.log(
      `[${correlationKey}] ${method} ${url} ${userId} ${userAgent} ${ip}: ${
        context.getClass().name
      } ${context.getHandler().name}`,
    );

    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();

        const { statusCode } = response;
        const contentLength = response.get('content-length');

        this.logger.log(
          `[${correlationKey}] ${method} ${url} ${statusCode} ${contentLength}: ${
            Date.now() - now
          }ms`,
        );
      }),
    );
  }
}
