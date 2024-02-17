import { UserType } from '@app/shared/enums/userType.enum';
import { Request } from 'express';

export interface UserRequest extends Request {
  user?: {
    id: number;
    email: string;
    type: UserType;
  };
}
