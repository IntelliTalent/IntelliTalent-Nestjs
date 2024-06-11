import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './Create-User.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  id: string;
}

export const getUpdatableFields = (updateUser: UpdateUserDto) => {
  return {
    password: updateUser.password,
  };
};
