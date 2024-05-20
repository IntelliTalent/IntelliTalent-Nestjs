import { EmailTemplates } from '../constants/templates';
import { AtsEmailTemplateData } from './ats-email.template.dto';
import { ForgetPasswordTemplateData } from './forget-password-template-data';
import { ResetPasswordTemplateData } from './reset-password-email-data.dto';
import { VerifyEmailTemplateData } from './verify-email-template-data.dto';

export class TemplateData {
  to: string;
  data:
    | AtsEmailTemplateData
    | VerifyEmailTemplateData
    | ForgetPasswordTemplateData
    | ResetPasswordTemplateData;
}

export class SendEmailsDto {
  template: EmailTemplates;
  templateData: TemplateData[];
}
