import { Test, TestingModule } from '@nestjs/testing';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';

describe('QuizzesController', () => {
  let quizzesController: QuizzesController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [QuizzesController],
      providers: [QuizzesService],
    }).compile();

    quizzesController = app.get<QuizzesController>(QuizzesController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(quizzesController.getHello()).toBe('Hello World!');
    });
  });
});
