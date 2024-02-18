import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { MonogoDBName, SharedModule } from '@app/shared';
import { MongooseModule } from '@nestjs/mongoose';
import { Cat, CatSchema } from './schemas/cat.schema';

@Module({
  imports: [SharedModule.registerMongoDB(MonogoDBName.ScrappedJobsDB), MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }])],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
