import { User } from '@app/shared';

export class UpdateUserDto extends User {}

export const getUpdatableFields = (updateUser: UpdateUserDto) => {
  return {
    password: updateUser.password,
  };
};
