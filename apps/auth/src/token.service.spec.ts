import { Test, TestingModule } from '@nestjs/testing';
import {  ServiceName, SharedModule, Token, } from '@app/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenService } from './token.service';
import { BadRequestException } from '@nestjs/common';

describe('TokenService', () => {
  let tokenService: TokenService;


  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SharedModule.registerPostgres(
          ServiceName.TESTING_DATABASE,
          [Token],
          true,
        ),
        TypeOrmModule.forFeature([Token]),
      ],
      providers: [
        TokenService,
      ],
    }).compile();

    tokenService = module.get<TokenService>(TokenService);
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
