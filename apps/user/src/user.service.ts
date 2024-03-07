import {
  CreateUserDto,
  UpdateUserDto,
  getUpdatableFields,
} from '@app/services_communications';
import { Constants, User } from '@app/shared';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { FindUserInterface } from '../../../libs/services_communications/src/userService/interfaces/findUser.interface';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import getConfigVariables from '@app/shared/config/configVariables.config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  getHello(): string {
    return 'Hello World From User Service!';
  }

  async doesUserExist(findUserInterface: FindUserInterface): Promise<boolean> {
    return await this.userRepository.existsBy({ ...findUserInterface });
  }

  async createUser(createUser: CreateUserDto): Promise<User> {
    const { email } = createUser;
    const doesUserExist = await this.doesUserExist({
      email,
    });

    if (doesUserExist) {
      throw new RpcException(
        new BadRequestException('User with this email already exists'),
      );
    }

    const salt: number = +(await getConfigVariables(Constants.JWT.salt));
    createUser.password = await bcrypt.hash(createUser.password, salt);

    const creaatedUser = await this.userRepository.create(createUser);

    return this.userRepository.save(creaatedUser);
  }

  async findUser(finduser: FindUserInterface): Promise<User> {
    const user = await this.userRepository.find({
      where: { ...finduser },
    });

    if (!user) {
      throw new RpcException(new NotFoundException('User not found'));
    }

    return user[0];
  }

  // TODO: need to edit for the update password
  async updateUser(updateUser: UpdateUserDto): Promise<User> {
    const { id } = updateUser;

    const updateableFields = getUpdatableFields(updateUser);

    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new RpcException(new NotFoundException('User not found'));
    }

    Object.assign(user, updateableFields);

    return this.userRepository.save(user);
  }

  async deleteUser(
    TakenActionId: string,
    deletedUserId: string,
  ): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: deletedUserId });

    if (!user) {
      throw new RpcException(new NotFoundException('User not found'));
    }

    await this.userRepository.delete({ id: deletedUserId });
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .getOne();

    console.log('user', user);

    if (!user) {
      throw new RpcException(
        new NotFoundException('Invalid email or password(not found)'),
      );
    }

    console.log('user', user);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    console.log('isPasswordValid', isPasswordValid);

    if (!isPasswordValid) {
      throw new RpcException(
        new NotFoundException('Invalid email or password'),
      );
    }

    delete user.password;

    return user;
  }
}
