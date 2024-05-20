import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { FormField, FormFieldSchema, SharedModule, User } from '@app/shared';
import { ServiceName } from '@app/shared/config/environment.constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongoDBName } from '@app/shared/config/mongodb.config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    SharedModule.registerPostgres(ServiceName.USER_SERVICE, [User]),
    TypeOrmModule.forFeature([User]),
    SharedModule.registerMongoDB(MongoDBName.FormFieldsDB),
    MongooseModule.forFeature([
      { name: FormField.name, schema: FormFieldSchema },
    ]),
    SharedModule.registerRmq(ServiceName.NOTIFIER_SERVICE),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
