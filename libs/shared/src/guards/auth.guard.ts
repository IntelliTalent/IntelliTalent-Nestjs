import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, Observable, of, switchMap } from 'rxjs';

/**
 * AuthGuard is a custom guard implementing the CanActivate interface from NestJS.
 * It is used to protect routes and determine whether a user can access a particular route.
 *
 *
 * @Inject('AUTH_SERVICE') - This decorator injects the 'AUTH_SERVICE' into the AuthGuard constructor. 'AUTH_SERVICE' is a microservice ClientProxy.
 *
 * canActivate() - This method is required by the CanActivate interface. It determines whether a route can be activated.
 *
 * The canActivate method does the following:
 * - Checks if the current context is an HTTP request. If not, it returns false.
 * - Retrieves the 'authorization' header from the request.
 * - If the 'authorization' header is not present, it returns false.
 * - Splits the 'authorization' header into two parts. If the header does not have exactly two parts, it returns false.
 * - Sends a 'verify-jwt' message to the 'AUTH_SERVICE' microservice with the JWT as data.
 * - The 'AUTH_SERVICE' microservice to return an object with an 'exp' property, which is the expiration time of the JWT in seconds.
 * - If the 'exp' property is not present, it returns an Observable that resolves to false.
 * - If the current time is less than the expiration time of the JWT, it returns an Observable that resolves to true. Otherwise, it returns an Observable that resolves to false.
 * - If an error occurs while communicating with the 'AUTH_SERVICE' microservice, it throws an UnauthorizedException with the message 'Invalid Token'.
 */

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== 'http') {
      return false;
    }

    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers['authorization'];

    if (!authHeader) return false;

    const authHeaderParts = (authHeader as string).split(' ');

    if (authHeaderParts.length !== 2) return false;

    const [, jwt] = authHeaderParts;

    return this.authService.send({ cmd: 'verify-jwt' }, { jwt }).pipe(
      switchMap(({ exp }) => {
        if (!exp) return of(false);

        const TOKEN_EXP_MS = exp * 1000;

        const isJwtValid = Date.now() < TOKEN_EXP_MS;

        return of(isJwtValid);
      }),
      catchError(() => {
        throw new UnauthorizedException('Invalid Token');
      }),
    );
  }
}
