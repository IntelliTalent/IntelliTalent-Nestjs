import { Module } from '@nestjs/common';
import { FilteringController } from './filtering.controller';
import { FilteringService } from './filtering.service';
import { SharedModule } from '@app/shared';

@Module({
  imports: [SharedModule],
  controllers: [FilteringController],
  providers: [FilteringService],
})
export class FilteringModule {}
