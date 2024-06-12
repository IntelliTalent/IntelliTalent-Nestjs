import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * ErrorInterceptor is a custom interceptor implementing the NestInterceptor interface from NestJS.
 * It is used to catch exceptions thrown from handling a request in a route handler or another interceptor.
 *
 *
 * The intercept method does the following:
 * - Calls the handle() method of the next object in the interceptor chain. This returns an Observable.
 * - Pipes the Observable through the catchError operator. This operator catches any exceptions thrown from the Observable.
 * - In the catchError operator, it logs the error and then rethrows the error using the throwError function from rxjs. The rethrown error is the response property of the original error.
 * - The rethrown error can then be caught and handled by an exception filter.
 */
@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      catchError((err) => {
        console.error('error interceptor', err);
        return throwError(() => err.response);
      }),
    );
  }
}
