import { Test, TestingModule } from '@nestjs/testing';
import { AutofillController } from './autofill.controller';
import { AutofillService } from './autofill.service';

describe('AutofillController', () => {
  let autofillController: AutofillController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AutofillController],
      providers: [AutofillService],
    }).compile();

    autofillController = app.get<AutofillController>(AutofillController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(autofillController.getHello()).toBe('Hello World!');
    });
  });
});
