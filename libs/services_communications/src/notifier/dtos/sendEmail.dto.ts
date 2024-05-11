import { EmailTemplates } from '../constants/templates';
import { atsEmailTemplateData } from './ats-email.template.dto';

export class TemplateData {
  to: string;
  data: atsEmailTemplateData | any;
}

export class SendEmailsDto {
  template: EmailTemplates;
  templateData: TemplateData[];
}
