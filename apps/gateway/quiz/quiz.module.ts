import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { ServiceName, SharedModule } from '@app/shared';

@Module({
  imports: [SharedModule.registerRmq(ServiceName.QUIZ_SERVICE)],
  controllers: [QuizController],
})
export class ApiQuizModule {}
