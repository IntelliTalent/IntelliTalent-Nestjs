import { Module } from '@nestjs/common';
import { AtsController } from './ats.controller';
import { AtsService } from './ats.service';
import { Education, Experience, Certificate, Filteration, Profile, Project, ServiceName, SharedModule } from '@app/shared';
import { RedisDBName } from '@app/shared/config/redis.config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    SharedModule.registerRmq(ServiceName.ATS_SERVICE), 
    SharedModule.registerRmq(ServiceName.USER_SERVICE),
    SharedModule.registerRedis(RedisDBName.jobsDB),
    SharedModule.registerPostgres(ServiceName.ATS_SERVICE, [Filteration]),
    SharedModule.registerPostgres(ServiceName.PROFILE_SERVICE, [
      Profile,
      Certificate,
      Project,
      Education,
      Experience,
    ]),
    TypeOrmModule.forFeature([Profile, Filteration, Certificate, Project, Education, Experience,]),
    // TODO: uncomment this
    /*SharedModule.registerPostgres(ServiceName.ATS_SERVICE, [Profile, Filteration]),
    TypeOrmModule.forFeature([Profile, Filteration]),*/
  ],
  controllers: [AtsController],
  providers: [AtsService],
})
export class AtsModule {}
