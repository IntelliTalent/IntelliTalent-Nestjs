import { Test, TestingModule } from '@nestjs/testing';
import {  ServiceName, SharedModule, Token, } from '@app/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { Quiz } from '@app/shared/entities/quiz.entity';
import { send } from 'process';

describe('TokenService', () => {
  let quizzesService: QuizzesService;
  let mockQuizzesGeneratorService: any;


  beforeEach(async () => {

    quizzesService = {
      send: jest.fn(() => Promise.resolve()),
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SharedModule.registerPostgres(
          ServiceName.TESTING_DATABASE,
          [Quiz],
          true,
        ),
        TypeOrmModule.forFeature([Quiz]),
      ],
      providers: [
        QuizzesService,
      ],
    }).compile();

    quizzesService = module.get<QuizzesService>(QuizzesService);
  });

  it('should be defined', () => {
    expect(tokenService).toBeDefined();
  });

  it('should create token', async () => {
    const uuid = '123';
    const token = await tokenService.createToken(uuid);
    expect(token.uuid).toBe(uuid);
    expect(token.isUsed).toBe(false);
  });


  it('should use token', async () => {
    const uuid = '123';
    const token = await tokenService.createToken(uuid);
    const result = await tokenService.useToken(uuid);
    expect(result.message).toBe('Token used successfully');
  });

  it('should throw error if token not found', async () => {
    const uuid = '123';
    try {
      await tokenService.useToken(uuid);
    }
    catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
    }
  });

  it('should throw error if token already used', async () => {
    const uuid = '123';
    await tokenService.createToken(uuid);
    await tokenService.useToken(uuid);

    try {
      await tokenService.useToken(uuid);
    }
    catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
    }
  });


});
