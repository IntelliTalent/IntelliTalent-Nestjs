import { Module } from '@nestjs/common';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from '@app/shared/entities/quiz.entity';
import { ServiceName, SharedModule } from '@app/shared';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quiz]),
    SharedModule.registerRmq(ServiceName.QUIZ_GENERATOR_SERVICE),
    SharedModule.registerPostgres(ServiceName.QUIZ_SERVICE, [Quiz]),
  ],
  controllers: [QuizzesController],
  providers: [QuizzesService],
})
export class QuizzesModule {}
