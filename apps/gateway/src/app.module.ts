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
import { ApiCVGeneratorModule } from '../cv-generator/cv-generator.module';
import { ApiCvExtractorModule } from '../cv-extractor/cv-extractor.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@app/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@app/shared/guards/roles.guard';

@Module({
  imports: [
    SharedModule.registerRmq(ServiceName.AUTH_SERVICE),
    SharedModule.registerRmq(ServiceName.USER_SERVICE),
    SharedModule.registerRmq(ServiceName.PROFILE_SERVICE),
    SharedModule.registerRmq(ServiceName.ATS_SERVICE),
    SharedModule.registerRmq(ServiceName.COVER_LETTER_GENERATOR_SERVICE),
    SharedModule.registerRmq(ServiceName.CV_GENERATOR_SERVICE),
    SharedModule.registerRmq(ServiceName.CV_EXTRACTOR_SERVICE),
    SharedModule.registerRmq(ServiceName.JOB_SERVICE),
    ApiAuthModule,
    ApiATSModule,
    ApiCoverLetterGeneratorModule,
    ApiCVGeneratorModule,
    ApiProfileModule,
    ApiCvExtractorModule,
    ApiJobsModule,
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
