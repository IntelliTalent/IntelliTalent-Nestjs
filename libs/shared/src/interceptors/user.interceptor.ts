import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { ClientProxy } from '@nestjs/microservices';

import { Observable, switchMap, catchError } from 'rxjs';

import { UserJwt } from '../../../services_communications/src/authService/interfaces/user-jwt.interface';

/**
 * UserInterceptor is a custom interceptor implementing the NestInterceptor interface from NestJS.
 * It is used to decode the JWT from the 'authorization' header of an HTTP request and attach the decoded user to the request object.
 *
 *
 * @Inject('AUTH_SERVICE') - This decorator injects the 'AUTH_SERVICE' into the UserInterceptor constructor. 'AUTH_SERVICE' is a microservice.
 *
 *
 * The intercept method does the following:
 * - Checks if the current context is an HTTP request. If not, it returns the Observable returned by the handle() method of the next object in the interceptor chain.
 * - Retrieves the 'authorization' header from the request.
 * - If the 'authorization' header is not present, it returns the Observable returned by the handle() method of the next object in the interceptor chain.
 * - Splits the 'authorization' header into two parts. If the header does not have exactly two parts, it returns the Observable returned by the handle() method of the next object in the interceptor chain.
 * - Sends a 'decode-jwt' message to the 'AUTH_SERVICE' microservice with the JWT as data.
 * - The 'AUTH_SERVICE' microservice is expected to return an object with a 'user' property, which is the decoded user from the JWT.
 * - Attaches the decoded user to the request object.
 * - Returns the Observable returned by the handle() method of the next object in the interceptor chain.
 * - If an error occurs while communicating with the 'AUTH_SERVICE' microservice, it returns the Observable returned by the handle() method of the next object in the interceptor chain.
 */
@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    if (ctx.getType() !== 'http') return next.handle();

    const request = ctx.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) return next.handle();

    const authHeaderParts = authHeader.split(' ');

    if (authHeaderParts.length !== 2) return next.handle();

    const [, jwt] = authHeaderParts;

    return this.authService.send<UserJwt>({ cmd: 'decode-jwt' }, { jwt }).pipe(
      switchMap(({ user }) => {
        request.user = user;
        return next.handle();
      }),
      catchError(() => next.handle()),
    );
  }
}
