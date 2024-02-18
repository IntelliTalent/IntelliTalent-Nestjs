import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class NotifierService {
  constructor(@InjectRedis() private readonly redis: Redis) {
    this.getValue('wewadfdasfdsf');
  }

  getHello(): string {
    return 'Hello World!';
  }

  async getValue(key: string): Promise<string> {
    await this.redis.set(key, key);
    const result = await this.redis.get(key);
    console.log('result', result);
    return result;
  }
}
