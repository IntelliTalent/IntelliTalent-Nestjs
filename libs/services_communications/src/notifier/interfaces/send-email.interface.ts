import { EmailTemplates } from "../constants/templates";

export interface SendEmail {
    templateId: EmailTemplates;
    emails: object[];
}