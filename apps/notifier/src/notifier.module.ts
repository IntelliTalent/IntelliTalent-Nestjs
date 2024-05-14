import { Module } from '@nestjs/common';
import { NotifierController } from './notifier.controller';
import { NotifierService } from './notifier.service';
import { Constants, SharedModule } from '@app/shared';
import { RedisDBName } from '@app/shared/config/redis.config';
import { MailerModule } from '@nestjs-modules/mailer';
import getConfigVariables from '@app/shared/config/configVariables.config';

@Module({
  imports: [
    SharedModule.registerRedis(RedisDBName.mailingDB),
    MailerModule.forRootAsync({
      useFactory: async () => ({
        transport: {
          host: await getConfigVariables(Constants.EMAIL.host),
          port: await getConfigVariables(Constants.EMAIL.port),
          secure: false, // upgrade later with STARTTLS
          auth: {
            // Account gmail address
            user: await getConfigVariables(Constants.EMAIL.user),
            pass: await getConfigVariables(Constants.EMAIL.pass),
          },
        },
      }),
    }),
  ],
  controllers: [NotifierController],
  providers: [NotifierService],
})
export class NotifierModule {}
