import {
  AtsEmailTemplateData,
  EmailTemplates,
  ForgetPasswordTemplateData,
  InterviewTemplateData,
  QuizEmailTemplateData,
  RejectionEmailTemplateData,
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

    case EmailTemplates.QUIZ:
      return data.templateData.map((mailData) => {
        return {
          to: mailData.to,
          from: senderEmail,
          ...quizEmailTemplate(mailData.data as QuizEmailTemplateData),
        };
      });

    case EmailTemplates.INTERVIEW:
      return data.templateData.map((mailData) => {
        return {
          to: mailData.to,
          from: senderEmail,
          ...interviewEmailTemplate(mailData.data as InterviewTemplateData),
        };
      });

      case EmailTemplates.REJECTION:
      return data.templateData.map((mailData) => {
        return {
          to: mailData.to,
          from: senderEmail,
          ...rejectionEmailTemplate(mailData.data as RejectionEmailTemplateData),
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

export function quizEmailTemplate(
  templateData: QuizEmailTemplateData,
): IEmailTemplate {
  const subject = 'Quiz Email';
  const quizUrl = `${getConfigVariables(Constants.FRONT_END_URL)}/quiz/${templateData.quizSlug}`;
  const html = `
      <h1>Hi ${templateData.firstName} ${templateData.lastName},</h1>
      <p> Job Title: ${templateData.jobTitle}</p>
      <a href="${quizUrl}">Quiz</a>
      `;
  return { subject, html };
}

export function interviewEmailTemplate(
  templateData: InterviewTemplateData,
): IEmailTemplate {
  const subject = 'Interview Email';
  const interviewUrl = `${getConfigVariables(Constants.FRONT_END_URL)}/interview/${templateData.profileId}/${templateData.jobId}`;
  const html = `
      <h1>Hi ${templateData.firstName} ${templateData.lastName},</h1>
      <p> Job Title: ${templateData.jobTitle}</p>
      <a href="${interviewUrl}">Interview</a>
      `;
  return { subject, html };
}

export function rejectionEmailTemplate(
  templateData: RejectionEmailTemplateData,
): IEmailTemplate {
  const { firstName, jobCompany, jobTitle, lastName, stage} = templateData;
  const subject = 'Update on your application for ${jobTitle} at ${jobCompany}';
  const html = `
      <h1>Hi ${firstName} ${lastName},</h1>
      <p> unless you are a good fit for the role, we will not be moving forward with your application for ${jobTitle} at ${jobCompany}</p>
      <p> so for the ${stage} stage, we will not be moving forward with your application</p>
      `;
  return { subject, html };
}
