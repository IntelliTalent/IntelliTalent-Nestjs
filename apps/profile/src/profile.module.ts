import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import {
  Certificate,
  Education,
  Experience,
  Profile,
  Project,
  ServiceName,
  SharedModule,
} from '@app/shared';

@Module({
  imports: [
    SharedModule.registerPostgres(ServiceName.PROFILE_SERVICE, [
      Profile,
      Certificate,
      Project,
      Education,
      Experience,
    ]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
