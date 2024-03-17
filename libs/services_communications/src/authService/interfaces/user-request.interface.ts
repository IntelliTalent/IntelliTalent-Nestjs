import { UserType } from '@app/shared/enums/userType.enum';
import { Request } from 'express';

export interface TokenPayload {
  id: string;
  email: string;
  type: UserType;
}

export interface UserRequest extends Request {
    id: string;
    email: string;
    type: UserType;
}
