import { InjectRedis } from '@nestjs-modules/ioredis';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { handleTemplate, IEmail } from './templates';
import { recentEmailsExpire, recentEmailsKey } from '@app/shared';
import { Cron } from '@nestjs/schedule';
@Injectable()
export class NotifierService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly mailService: MailerService,
  ) {
  }

  sendEmails(emails: IEmail[]) {
    const now = Date.now();
    emails.forEach(async (email) => {
      // Update this email in Redis to be true
      const score = now + recentEmailsExpire; // score as future timestamp
      await this.redis.zadd(recentEmailsKey, score, email.to); // Add to sorted set

      // send the email
      await this.sendMail(email);
    });
  }

  @Cron('0 0 * * * *') // Every hour
  async cleanupExpiredEmails() {
    const now = Date.now();
    await this.redis.zremrangebyscore(recentEmailsKey, '-inf', now); // Removes all past timestamps
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
