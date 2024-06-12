import { Token } from '@app/shared';
import { BadRequestException, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  // Write function to create token using uuid
  async createToken(uuid: string): Promise<Token> {
    const token = this.tokenRepository.create({ uuid });
    return this.tokenRepository.save(token);
  }

  async useToken(uuid: string): Promise<{ message: string }> {
    const token = await this.tokenRepository.findOne({
      where: {
        uuid: uuid,
      },
    });

    if (!token) {
      throw new RpcException(new BadRequestException('Token not found'));
    }

    if (token.isUsed) {
      throw new RpcException(new BadRequestException('Token already used'));
    }

    token.isUsed = true;
    await this.tokenRepository.save(token);
    return {
      message: 'Token used successfully',
    };
  }
}
