import {
  AcceptanceEmailTemplateData,
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
import { TestingModule } from '@nestjs/testing';

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
          ...rejectionEmailTemplate(
            mailData.data as RejectionEmailTemplateData,
          ),
        };
      });

    case EmailTemplates.ACCEPTANCE:
      return data.templateData.map((mailData) => {
        return {
          to: mailData.to,
          from: senderEmail,
          ...acceptanceEmailTemplate(
            mailData.data as AcceptanceEmailTemplateData,
          ),
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
  const subject = 'Exciting Job Match Just for You!';
  const html = `
      ${userGreeting(templateData.firstName, templateData.lastName)}
      <div style="padding: 20px;">
        <p>We're thrilled to inform you that you've been matched with an exciting job opportunity!</p>
        <div style="border: 1px solid #dee2e6; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
          <p><strong>Job Title:</strong> ${templateData.jobTitle}</p>
          <p><strong>Company:</strong> ${templateData.jobCompany}</p>
          <p><strong>Job Details:</strong> <a href="${templateData.jobUrl}" style="color: #007bff;">Click here to view the job</a></p>
        </div>
        <p>You have ${templateData.matchedJobsCount} matched job(s) waiting for you. Don't miss out on these opportunities!</p>
        <p style="margin-top: 30px;">Best regards,</p>
        <p style="margin-top: 5px;">The Job Match Team</p>
      </div>
  `;
  return { subject, html: MailContainer(html) };
}


export function verifyEmailTemplate(
  templateData: VerifyEmailTemplateData,
): IEmailTemplate {
  const link = `${getConfigVariables(Constants.FRONT_END_URL)}/verify-email?token=${templateData.token}`;

  const subject = 'Verify your email';
  const html = `
      ${userGreeting(templateData.firstName, templateData.lastName)}
      <div style="padding: 20px; font-size: 24px;">

      <p>You have made the right choice to join the best job portal in the world.</p>

        <p>Please verify your email by clicking the link below:</p>

        ${MailButton(link, 'Verify Email')}

        </div>
  `;
  return { subject, html: MailContainer(html) };
}



export function forgetPasswordTemplate(
  templateData: ForgetPasswordTemplateData,
): IEmailTemplate {
  const link = `${getConfigVariables(Constants.FRONT_END_URL)}/reset-password?token=${templateData.token}`;

  const subject = 'Reset your password';
  const html = `
      ${userGreeting(templateData.firstName, templateData.lastName)}
      <div style="padding: 20px;">
        <p>Please reset your password by clicking the link below:</p>
        <a href="${link}" style="color: #007bff; text-decoration: none; padding: 10px 20px; background-color: #007bff; color: white; border-radius: 5px; display: inline-block;">Reset Password</a>
        <p>If you did not request to reset your password, you can safely ignore this email.</p>
      </div>
  `;
  return { subject, html: MailContainer(html) };
}


export function resetPasswordTemplate(
  templateData: ResetPasswordTemplateData,
): IEmailTemplate {
  const subject = 'Password Reset Successful';
  const html = `
      ${userGreeting(templateData.firstName, templateData.lastName)}
      <div style="padding: 20px;">
        <p>Your password has been reset successfully. If you did not initiate this change, please contact our support team immediately.</p>
        <p style="margin-top: 30px;">Best regards,</p>
        <p style="margin-top: 5px;">The Support Team</p>
      </div>
  `;
  return { subject, html: MailContainer(html) };
}


export function quizEmailTemplate(
  templateData: QuizEmailTemplateData,
): IEmailTemplate {
  const subject = 'Important: Quiz Invitation';
  const quizUrl = `${getConfigVariables(Constants.FRONT_END_URL)}/quiz/${templateData.quizSlug}`;
  const html = `
      ${userGreeting(templateData.firstName, templateData.lastName)}
      <div style="padding: 20px;">
        <p>We are excited to inform you about a quiz related to your job title: ${templateData.jobTitle}.</p>
        <p>Please click the link below to start the quiz:</p>
        <a href="${quizUrl}" style="color: #007bff; text-decoration: none; padding: 10px 20px; background-color: #007bff; color: white; border-radius: 5px; display: inline-block;">Start Quiz</a>
        <div style="margin-top: 20px;">
          <h3>Important Rules:</h3>
          <ul>
            <li>You are not allowed to leave the tab more than 3 times.</li>
            <li>You have 3 chances to open the quiz in case of any issues.</li>
            <li>Do not refresh the page during the quiz.</li>
            <li>Do not use any external resources during the quiz.</li>
            <li>Do not share the quiz link with anyone. since its valid for you only.</li>
            <li>you can only take the quiz once.</li>
          </ul>
        </div>
        <p style="margin-top: 30px;">Best regards,</p>
        <p style="margin-top: 5px;">The Quiz Team</p>
      </div>
  `;
  return { subject, html: MailContainer(html) };
}

export function interviewEmailTemplate(
  templateData: InterviewTemplateData,
): IEmailTemplate {
  const subject = 'Interview Invitation';
  const interviewUrl = `${getConfigVariables(Constants.FRONT_END_URL)}/interview/${templateData.profileId}/${templateData.jobId}`;
  const html = `
      ${userGreeting(templateData.firstName, templateData.lastName)}
      <div style="padding: 20px;">
        <p>We are pleased to invite you for an interview for the position of ${templateData.jobTitle}.</p>
        <p>Please click the link below to view your interview details and schedule:</p>
        <a href="${interviewUrl}" style="color: #007bff; text-decoration: none; padding: 10px 20px; background-color: #007bff; color: white; border-radius: 5px; display: inline-block;">View Interview Details</a>
        <p style="margin-top: 30px;">Best regards,</p>
        <p style="margin-top: 5px;">The Recruitment Team</p>
    </div>
  `;
  return { subject, html: MailContainer(html) };
}

export function rejectionEmailTemplate(
  templateData: RejectionEmailTemplateData,
): IEmailTemplate {
  const { firstName, jobCompany, jobTitle, lastName, stage } = templateData;
  const subject = `Update on your application for ${jobTitle} at ${jobCompany}`;
  const html = `
      ${userGreeting(firstName, lastName)}
      <div style="padding: 20px;">
        <p>Thank you so much for your interest in the ${jobTitle} position at ${jobCompany}. We genuinely appreciate the time and effort you put into your application and interview process.</p>
        <p>After careful consideration, we have decided to move forward with other candidates who more closely match the requirements for the role at this time. This decision was not easy, as we were very impressed with your qualifications and experience.</p>
        <p>We encourage you to apply for future openings that match your skills and interests. We will keep your resume on file and contact you if a position becomes available that aligns with your background.</p>
        <p>We wish you all the best in your job search and future professional endeavors.</p>
        <p style="margin-top: 30px;">Warm regards,</p>
        <p style="margin-top: 5px;">The Recruitment Team at ${jobCompany}</p>
      </div>
  `;
  return { subject, html: MailContainer(html) };
}

export function acceptanceEmailTemplate(
  tempData: AcceptanceEmailTemplateData,
): IEmailTemplate {
  const { firstName, jobCompany, jobTitle, lastName } = tempData;
  const subject = `Congratulations! You've been accepted for the ${jobTitle} position at ${jobCompany}`;
  const html = `
      ${userGreeting(firstName, lastName)}
      <div style="padding: 20px;">
        <p>We are thrilled to inform you that you have been accepted for the position of ${jobTitle} at ${jobCompany}. Your skills and experience are a perfect match for our team, and we are excited to see the contributions you will bring to our company.</p>
        <p>The HR team at ${jobCompany} will be in touch with you as soon as possible to guide you through the next steps of the hiring process. They will provide you with all the necessary information and support you need to get started.</p>
        <p>We believe you will find this opportunity both rewarding and challenging, and we are confident that you will thrive in your new role. We look forward to working with you and supporting your growth and success within our organization.</p>
        <p>We look forward to welcoming you to the ${jobCompany} family!</p>
        <p style="margin-top: 30px;">Warm regards,</p>
        <p style="margin-top: 5px;">The Recruitment Team at ${jobCompany}</p>
      </div>
  `;
  return { subject, html: MailContainer(html) };
}


export const MailContainer = (html: string) => `

<div class="m_-8376988204030579956body" style="padding:0!important;margin:0 auto!important;display:block!important;min-width:100%!important;width:100%!important;background:#ffffff">
  <center>
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:0;padding:0;width:100%" bgcolor="#ffffff" class="m_-8376988204030579956gwfw">
      <tbody>
        <tr>
          <td style="margin:0;padding:0;width:100%" align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" class="m_-8376988204030579956m-shell">
              <tbody>
                <!-- Header -->
                <tr>
                  <td class="m_-8376988204030579956td" style="width:600px;min-width:600px;padding:0;margin:0;font-weight:normal">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tbody>
                        <tr>
                          <td style="text-align:left">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                              <tbody>
                                <tr>
                                  <td class="m_-8376988204030579956mpx-16" style="padding-left:32px;padding-right:32px">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                      <tbody>
                                        <tr>
                                          <td class="m_-8376988204030579956mpb-20" style="padding-top:16px;padding-bottom:28px">
                                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                              <tbody>
                                                <tr>
                                                  <td class="m_-8376988204030579956mpb-28" style="padding-bottom:34px">
                                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                      <tbody>
                                                        <tr>
                                                          <td style="text-align:left">
                                                            <a href="http://localhost:3000/" target="_blank" style="display: flex; align-items: center; gap: 1rem;text-decoration: none;color: #000000;">
                                                              <img src="https://intellitalentstorage.blob.core.windows.net/general/762e1d19-8be9-46ff-ace6-29c7cb53b12c-logo.png" width="50" height="50" border="0" alt="" class="CToWUd" data-bit="iit">
                                                              <p style="font-size: 1rem;font-family: monospace;color: #000000;font-weight: bold;">Intelli-Talent</p>
                                                            </a>
                                                          </td>
                                                          <td width="20" style="text-align:left"></td>
                                                          <td style="text-align:left">
                                                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                              <tbody>
                                                                <tr>
                                                                  <td align="right">
                                                                    <table border="0" cellspacing="0" cellpadding="0">
                                                                      <!-- Add any additional content for the right-aligned section here -->
                                                                    </table>
                                                                  </td>
                                                                </tr>
                                                              </tbody>
                                                            </table>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>


                <!-- Content -->
                <div style="font-family: Arial, sans-serif; color: #333;font-size: 20px;">
                ${html}
                </div>


                <!-- Footer -->
                <tr >
                  <td class="m_-8376988204030579956fluid-img" style="text-align:left;">
                    <img src="https://intellitalentstorage.blob.core.windows.net/general/d424b99e-2a67-46ae-a83f-c10c0733f65b-footer.png" alt="" width="600" style="margin-top: 30px;" height="115" border="0" class="CToWUd a6T" data-bit="iit" tabindex="0">
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </center>
  <img alt="" src="https://ci5.googleusercontent.com/proxy/xY03fzVRjQtxkqW0kfKqqpOaNZhARRLJ6hr94em-4JAwqit3kBBM7HtUDwjV-6sM9eYcTxNWOM_gETEOoOtHUjhK3DjShLWYq9OYiVPh_v5vbH79nXFP_FXw-lgKId5ezWAz31JoEBlTzfZWWIG-X0QeYGoAzl1zXPHM7FLjunnfNi9f9GAP8ME7009B8AorUHsX8Nh9uUmNnVjD=s0-d-e1-ft#https://ql9whnmm.r.us-east-1.awstrack.me/I0/010001840b8a690a-a98182e0-166f-4315-84b5-62ea2a5c983e-000000/TU0_xh-U2pIacvQ2-gFKFoD8Hs4=292" style="display:none;width:1px;height:1px" class="CToWUd" data-bit="iit">
</div>
`;


function userGreeting(firstName: string, lastName: string = ''): string {
  return `
    <div style="background-color: #f8f9fa; padding: 20px; border-bottom: 2px solid #007bff;">
      <h1 style="color: #007bff;">Hi ${firstName} ${lastName},</h1>
    </div>
  `;
}

export const MailButton = (url: string, text: string) => `
<div >
<tbody>
  <tr>
<td class="m_-8376988204030579956btn-14" style="border-radius:4px;font-size:24px;line-height:18px;font-family:Helvetica,Arial,sans-serif;text-align:center;width:50%!important">
  <a href="${url}" style="display:block;padding:8px;text-decoration:none;color:#ffffff;width:fit-content;background-color: #0079d3;border-radius: 10px;margin: auto; padding: 1rem;" target="_blank">
    <span style="text-decoration:none;color:#ffffff"><strong>${text}</strong></span></a></td>
</tr>
</tbody>
</div>
`;
