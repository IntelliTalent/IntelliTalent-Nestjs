import { InjectRedis } from '@nestjs-modules/ioredis';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Redis } from 'ioredis';

@Injectable()
export class NotifierService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly mailService: MailerService,
  ) {
    // console.log('NotifierService');
    // this.getValue('test');
    // this.sendMail();
  }

  sendMail() {
    this.mailService.sendMail({
      to: 'elwaeryousef1@gmail.com',
      from: 'elwaeryousef@gmail.com',
      subject: 'Testing Nest MailerModule ✔',
      text: 'welcome',
      html: '<b>welcome</b>',
    });
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
