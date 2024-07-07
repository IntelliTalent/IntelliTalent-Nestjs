import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppliedUsers, CustomJobsStages, Education, Experience, Filteration, Interview, Profile, Project, SharedModule, StructuredJob, Token, User } from '@app/shared';
import { ServiceName } from '@app/shared/config/environment.constants';
import { ApiAuthModule } from '../auth/auth.module';
import { ApiATSModule } from '../ats/ats.module';
import { ApiCoverLetterGeneratorModule } from '../cover-letter-generator/cover-letter-generator.module';
import { ApiProfileModule } from '../profile/profile.module';
import { ApiJobsModule } from '../jobs/jobs.module';
import { ApiCVGeneratorModule } from '../cv-generator/cv-generator.module';
import { ApiCvExtractorModule } from '../cv-extractor/cv-extractor.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@app/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@app/shared/guards/roles.guard';
import { ApiUploaderModule } from '../uploader/uploader.module';
import { ApiQuizModule } from '../quiz/quiz.module';
import { ApiAutofillModule } from '../autofill/autofill.module';
import { ApiCustomJobModule } from '../custom-job/custom-job.module';
import { ApiFilterationModule } from '../filteration/filteration.module';
import { ApiUserModule } from '../user/user.module';
import { Quiz } from '@app/shared/entities/quiz.entity';
import { Certificate } from 'crypto';

@Module({
  imports: [
    SharedModule.registerRmq(ServiceName.AUTH_SERVICE),
    SharedModule.registerRmq(ServiceName.USER_SERVICE),
    SharedModule.registerRmq(ServiceName.USER_SERVICE),
    SharedModule.registerRmq(ServiceName.PROFILE_SERVICE),
    SharedModule.registerRmq(ServiceName.ATS_SERVICE),
    SharedModule.registerRmq(ServiceName.COVER_LETTER_GENERATOR_SERVICE),
    SharedModule.registerRmq(ServiceName.FILTERATION_SERVICE),
    SharedModule.registerRmq(ServiceName.CV_GENERATOR_SERVICE),
    SharedModule.registerRmq(ServiceName.CV_EXTRACTOR_SERVICE),
    SharedModule.registerRmq(ServiceName.JOB_SERVICE),
    SharedModule.registerPostgres(ServiceName.TESTING_DATABASE, [
      Interview,
      Filteration,
      CustomJobsStages,
      User,
      Token,
      AppliedUsers,
      StructuredJob,
      Quiz,
    ]),
    ApiAuthModule,
    ApiATSModule,
    ApiCoverLetterGeneratorModule,
    ApiCVGeneratorModule,
    ApiProfileModule,
    ApiCvExtractorModule,
    ApiJobsModule,
    ApiUploaderModule,
    ApiQuizModule,
    ApiAutofillModule,
    ApiCustomJobModule,
    ApiFilterationModule,
    ApiUserModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
