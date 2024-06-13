import {
  AllowedUserTypes,
  CreateUserDto,
  EmailTemplates,
  NotifierEvents,
  SendEmailsDto,
  TemplateData,
  UpdateUserDto,
  changePasswordDto,
} from '@app/services_communications';
import { Constants, FormField, ServiceName, User, UserType } from '@app/shared';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { FindUserInterface } from '../../../libs/services_communications/src/userService/interfaces/findUser.interface';
import * as bcrypt from 'bcryptjs';
import { FindOneOptions, In, Repository } from 'typeorm';
import getConfigVariables from '@app/shared/config/configVariables.config';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PageOptionsDto } from '@app/shared/api-features/dtos/page-options.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectModel(FormField.name)
    private readonly formFieldModel: Model<FormField>,
    @Inject(ServiceName.NOTIFIER_SERVICE)
    private readonly notifierService: ClientProxy,
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
      throw new BadRequestException(
        'User with this email already exists or wait for the email verification to complete',
      );
    }

    const salt: number = +(await getConfigVariables(Constants.JWT.salt));
    createUser.password = await bcrypt.hash(createUser.password, salt);

    const databaseUserType =
      createUser.type === AllowedUserTypes.jobSeeker
        ? UserType.jobSeeker
        : UserType.recruiter;

    const createdUser = this.userRepository.create({
      ...createUser,
      type: databaseUserType,
    });

    const savedUser = await this.userRepository.save(createdUser);

    // send on init
    await this.formFieldModel.create({
      ...createdUser,
      userId: savedUser.id,
      fullName: `${createdUser.firstName} ${createdUser.lastName}`,
    });

    return savedUser;
  }

  async findUser(finduser: FindOneOptions<User>): Promise<User> {
    const user = await this.userRepository.findOne(finduser);

    if (!user) {
      throw new NotFoundException(
        `user with ${Object.keys(finduser.where)} : ${Object.values(finduser.where)} not found`,
      );
    }

    return user;
  }

  async getUsersByIds(usersIds: string[]){
      return this.userRepository.find({
        where: {
          id: In(usersIds),
        },
      });
    
  }

  // TODO: need to edit for the update password
  async updateUser(updateUser: UpdateUserDto): Promise<User> {
    delete updateUser.password;
    delete updateUser.email;
    delete updateUser.type;

    const { id } = updateUser;

    const user = await this.findUser({ where: { id } });

    Object.assign(user, updateUser);

    return this.userRepository.save(user);
  }

  async deleteUser(
    TakenActionId: string,
    deletedUserId: string,
  ): Promise<void> {
    const user = await this.findUser({ where: { id: deletedUserId } });

    if (!user) {
      throw new NotFoundException('User not found');
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
      .select(['user.password', 'user.isVerified', 'user.id'])
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password(not found)');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isVerified) {
      throw new BadRequestException(
        'Please verify your email first, check your email for the verification link',
      );
    }

    delete user.password;

    return this.userRepository.findOneBy({ id: user.id });
  }

  async chagePasswordUsingToken(
    userId: string,
    password: string,
  ): Promise<{ message: string }> {
    const salt: number = +(await getConfigVariables(Constants.JWT.salt));
    const hashedPassword = await bcrypt.hash(password, salt);
    await this.userRepository.update(
      { id: userId },
      { password: hashedPassword },
    );

    const user = await this.findUser({
      where: {
        id: userId,
      },
    });

    const emailData: TemplateData = {
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
      },
      to: user.email,
    };
    const sendEmailDto: SendEmailsDto = {
      template: EmailTemplates.RESETPASSWORD,
      templateData: [emailData],
    };
    this.notifierService.emit({ cmd: NotifierEvents.sendEmail }, sendEmailDto);

    return {
      message: 'Password changed successfully',
    };
  }

  async changePassword(dto: changePasswordDto): Promise<{ message: string }> {
    const { currentPassword, newPassword, userId } = dto;

    const user = await this.findUser({
      where: {
        id: userId,
      },
    });

    await this.validateUser(user.email, currentPassword);

    const salt: number = +(await getConfigVariables(Constants.JWT.salt));
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.userRepository.update(
      { id: userId },
      { password: hashedPassword },
    );

    return {
      message: 'Password changed successfully',
    };
  }

  async verifyUser(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`user with id ${id} not found`);
    }
    user.isVerified = true;

    return this.userRepository.save(user);
  }

  async getAllJobSeekers(pageOptions: PageOptionsDto): Promise<User[]> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.country',
        'user.city',
      ])
      .where('user.type = :type', { type: UserType.jobSeeker })
      .andWhere('user.isVerified = :isVerified', { isVerified: true });

    // Apply pagination
    const skip = (pageOptions.page - 1) * pageOptions.take;

    query.skip(skip).take(pageOptions.take);

    return await query.getMany();
  }
}
