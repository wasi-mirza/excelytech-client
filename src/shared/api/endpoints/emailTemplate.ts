import apiService from "../../services";
import { EmailTemplateInput, GetEmailTemplatesResponse, UpdateEmailTemplateInput } from "../types/email.types";

export const addEmailTemplate = async (emailTemplate: EmailTemplateInput) => {
  const response = await apiService.post('/email/new', emailTemplate);
  return response.data;
};

export const getEmailTemplates = async () => {
  const response = await apiService.get('/email/all');
  return response.data;
};

export const updateProposalEmailTemplate = async (emailTemplate: UpdateEmailTemplateInput) => {
  const response = await apiService.patch(`/proposalTemplate/templates/${emailTemplate.emailTemplateId}`, emailTemplate);
  return response.data;
};

export const getProposalEmailTemplateById = async (proposalTemplateId: string | undefined) => {
    const response = await apiService.get<GetEmailTemplatesResponse>(`/proposalTemplate/templates/${proposalTemplateId}`);
    return response.data;
  };