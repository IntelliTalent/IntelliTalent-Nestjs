import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from '@app/shared';
import { ServiceName } from '@app/shared/config/environment.constants';
import { ApiAuthModule } from '../auth/auth.module';
import { ApiATSModule } from '../ats/ats.module';
import { ApiCoverLetterGeneratorModule } from '../cover-letter-generator/cover-letter-generator.module';
import { ApiProfileModule } from '../profile/profile.module';
import { ApiJobsModule } from '../jobs/jobs.module';

@Module({
  imports: [
    SharedModule.registerRmq(ServiceName.AUTH_SERVICE),
    SharedModule.registerRmq(ServiceName.USER_SERVICE),
    SharedModule.registerRmq(ServiceName.ATS_SERVICE),
    SharedModule.registerRmq(ServiceName.COVER_LETTER_SERVICE),
    SharedModule.registerRmq(ServiceName.JOB_SERVICE),
    ApiAuthModule,
    ApiATSModule,
    ApiCoverLetterGeneratorModule,
    ApiProfileModule,
    ApiJobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
