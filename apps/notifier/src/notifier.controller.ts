import { Controller } from '@nestjs/common';
import { NotifierService } from './notifier.service';
import { NotifierEvents, SendEmailsDto } from '@app/services_communications';
import { EventPattern, Payload } from '@nestjs/microservices';
import { handleTemplate } from './templates';

@Controller()
export class NotifierController {
  constructor(private readonly notifierService: NotifierService) {}

  @EventPattern({ cmd: NotifierEvents.sendEmail })
  async sendMail(@Payload() data: SendEmailsDto) {
    const email = handleTemplate(data);
    this.notifierService.sendEmails(email);
  }
}
