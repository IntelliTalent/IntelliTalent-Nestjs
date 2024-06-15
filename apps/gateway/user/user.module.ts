import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { ServiceName, SharedModule } from '@app/shared';

@Module({
    imports: [
        SharedModule.registerRmq(ServiceName.USER_SERVICE),
    ],
    controllers: [UserController],
})
export class ApiUserModule {}
