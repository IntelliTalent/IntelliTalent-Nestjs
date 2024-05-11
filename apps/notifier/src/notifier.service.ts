import { InjectRedis } from '@nestjs-modules/ioredis';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class NotifierService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly mailService: MailerService,
  ) {}

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
}
