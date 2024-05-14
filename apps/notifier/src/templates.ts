import {
  EmailTemplates,
  SendEmailsDto,
  senderEmail,
} from '@app/services_communications';
import { atsEmailTemplateData } from '@app/services_communications/notifier/dtos/ats-email.template.dto';

export interface IEmail {
  to: string;
  from: string;
  subject: string;
  html: string;
}

export function handleTemplate(data: SendEmailsDto): IEmail[] {
  switch (data.template) {
    case EmailTemplates.ATSMATCHED:
      return data.templateData.map((mailData) => {
        return {
          to: mailData.to,
          from: senderEmail,
          ...AtsEmailTemplate(mailData.data),
        };
      });
      break;
  }
}

export interface IEmailTemplate {
  subject: string;
  html: string;
}

export function AtsEmailTemplate(
  templateData: atsEmailTemplateData,
): IEmailTemplate {
  const subject = 'You have been matched with a job';
  const html = `
    <h1>Hi ${templateData.firstName},</h1>
    <p> You have been matched with a job</p>
    <p> Job Title: ${templateData.jobTitle}</p>
    <p> Job Company: ${templateData.jobCompany}</p>
    <p> Job Url: ${templateData.jobUrl}</p>
    <p> Matched Jobs Count: ${templateData.matchedJobsCount}</p>
    `;
  return { subject, html };
}
