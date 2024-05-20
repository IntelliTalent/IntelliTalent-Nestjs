import { InjectRedis } from '@nestjs-modules/ioredis';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { IEmail } from './templates';
import { recentEmailsExpire, recentEmailsKey } from '@app/shared';

@Injectable()
export class NotifierService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly mailService: MailerService,
  ) {}

  sendEmails(emails: IEmail[]) {
    emails.forEach(async (email) => {
      // Update this email in Redis to be true
      await this.redis.hset(recentEmailsKey, email.to, 'true');
      await this.redis.expire(recentEmailsKey, recentEmailsExpire); // Set the TTL to recentEmailsExpire

      // send the email
      await this.sendMail(email);
    });
  }

  async sendMail(email: IEmail) {
    console.log('sending email', email);

    // await this.mailService.sendMail({
    //   to: email.to,
    //   from: email.from,
    //   subject: email.subject,
    //   html: email.html,
    // });
  }
}
