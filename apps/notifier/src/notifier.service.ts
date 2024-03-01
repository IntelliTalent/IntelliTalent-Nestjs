import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Redis } from 'ioredis';

@Injectable()
export class NotifierService {
  constructor(@InjectRedis() private readonly redis: Redis) {
    console.log('NotifierService');
    this.getValue('test');
  }

  getHello(): string {
    return 'Hello World!';
  }


  // @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron() {
    await this.redis.set('waer', 'wwwaaeerrr');
    const result = await this.redis.get('waer');
    console.log('resusdafadsflt', result);
  }

  async getValue(key: string) {
    await this.redis.set(key, key);
    const result = await this.redis.get(key);
    console.log('result', result);
    // return result;
  }
}
