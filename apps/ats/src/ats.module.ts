import { Module } from '@nestjs/common';
import { AtsController } from './ats.controller';
import { AtsService } from './ats.service';
import { ServiceName, SharedModule } from '@app/shared';
import { Matching } from '@app/shared/entities/matchiing.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    SharedModule.registerRmq(ServiceName.ATS_SERVICE),
    SharedModule.registerPostgres(ServiceName.FILTRATION_SERVICE, [Matching]),
    TypeOrmModule.forFeature([Matching]),
  ],
  controllers: [AtsController],
  providers: [AtsService],
})
export class AtsModule {}
