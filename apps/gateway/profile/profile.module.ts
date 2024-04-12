import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ServiceName, SharedModule } from '@app/shared';

@Module({
  imports: [
    SharedModule.registerRmq(ServiceName.PROFILE_SERVICE),
  ],
  controllers: [ProfileController]
})
export class ApiProfileModule {}
