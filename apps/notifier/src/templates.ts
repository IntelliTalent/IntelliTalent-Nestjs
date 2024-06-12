import {
  AtsEmailTemplateData,
  EmailTemplates,
  ForgetPasswordTemplateData,
  ResetPasswordTemplateData,
  SendEmailsDto,
  senderEmail,
  VerifyEmailTemplateData,
} from '@app/services_communications';
import { Constants } from '@app/shared';
import getConfigVariables from '@app/shared/config/configVariables.config';

export interface IEmail {
  to: string;
  from: string;
  subject: string;
  html: string;
}

export function handleTemplate(data: SendEmailsDto): IEmail[] {
  console.log('data', data);

  switch (data.template) {
    case EmailTemplates.ATSMATCHED:
      return data.templateData.map((mailData) => {
        return {
          to: mailData.to,
          from: senderEmail,
          ...atsEmailTemplate(mailData.data as AtsEmailTemplateData),
        };
      });

    case EmailTemplates.VERIFYEMAIL:
      return data.templateData.map((mailData) => {
        return {
          to: mailData.to,
          from: senderEmail,
          ...verifyEmailTemplate(mailData.data as VerifyEmailTemplateData),
        };
      });

    case EmailTemplates.FORGETPASSWORD:
      return data.templateData.map((mailData) => {
        return {
          to: mailData.to,
          from: senderEmail,
          ...forgetPasswordTemplate(
            mailData.data as ForgetPasswordTemplateData,
          ),
        };
      });

    case EmailTemplates.RESETPASSWORD:
      return data.templateData.map((mailData) => {
        return {
          to: mailData.to,
          from: senderEmail,
          ...resetPasswordTemplate(mailData.data as ResetPasswordTemplateData),
        };
      });
  }
}

export interface IEmailTemplate {
  subject: string;
  html: string;
}

export function atsEmailTemplate(
  templateData: AtsEmailTemplateData,
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

export function verifyEmailTemplate(
  templateData: VerifyEmailTemplateData,
): IEmailTemplate {
  const link = `${getConfigVariables(Constants.FRONT_END_URL)}/verify-email?token=${templateData.token}`;

  const subject = 'Verify your email';
  const html = `
    <h1>Hi ${templateData.firstName} ${templateData.lastName},</h1>
    <p> Please verify your email by clicking the link below</p>
    <a href="${link}">Verify Email</a>
    `;
  return { subject, html };
}

export function forgetPasswordTemplate(
  templateData: ForgetPasswordTemplateData,
): IEmailTemplate {
  const link = `${getConfigVariables(Constants.FRONT_END_URL)}/reset-password?token=${templateData.token}`;

  const subject = 'Reset your password';
  const html = `
    <h1>Hi ${templateData.firstName} ${templateData.lastName},</h1>
    <p> Please reset your password by clicking the link below</p>
    <a href="${link}">Reset Password</a>
    `;
  return { subject, html };
}

export function resetPasswordTemplate(
  templateData: ResetPasswordTemplateData,
): IEmailTemplate {
  const subject = 'Password Reset Successful';
  const html = `
    <h1>Hi ${templateData.firstName} ${templateData.lastName},</h1>
    <p> Your password has been reset successfully</p>
    `;
  return { subject, html };
}
