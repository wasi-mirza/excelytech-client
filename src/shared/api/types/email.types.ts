export interface EmailTemplateResponse {
    _id: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }

  export interface GetEmailTemplatesResponse {
    emailTemplates: EmailTemplateResponse;
  }

  export interface EmailTemplateInput {
    title: string;
    description: string;
    status: string;
  }

  export interface UpdateEmailTemplateInput {
    emailTemplateId: string;
    title: string;
    description: string;
    status: string;
  }
  