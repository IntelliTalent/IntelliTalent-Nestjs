import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from '@app/shared';
import { ServiceName } from '@app/shared/config/environment.constants';
import { ApiAuthModule } from '../auth/auth.module';
import { ApiATSModule } from '../ats/ats.module';
import { ApiCoverLetterGeneratorModule } from '../cover-letter-generator/cover-letter-generator.module';
import { ApiProfileModule } from '../profile/profile.module';
import { ApiCustomJobModule } from '../custom-job/custom-job.module';
import { ApiFilterationModule } from '../filteration/filteration.module';
import { ApiInterviewModule } from '../interview/interview.module';

@Module({
  imports: [
    SharedModule.registerRmq(ServiceName.AUTH_SERVICE),
    SharedModule.registerRmq(ServiceName.USER_SERVICE),
    SharedModule.registerRmq(ServiceName.ATS_SERVICE),
    SharedModule.registerRmq(ServiceName.COVER_LETTER_SERVICE),
    ApiAuthModule,
    ApiATSModule,
    ApiCoverLetterGeneratorModule,
    ApiProfileModule,
    ApiCustomJobModule,
    ApiFilterationModule,
    ApiInterviewModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

