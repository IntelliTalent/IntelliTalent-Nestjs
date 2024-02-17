import { SetMetadata } from '@nestjs/common';
import { UserType } from '../enums/userType.enum';

export const Roles = (...roles: UserType[]) => SetMetadata('roles', roles);
