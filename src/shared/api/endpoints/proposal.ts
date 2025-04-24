import apiService from "../../services";
import { GetProposalsResponse, ProposalPayload } from "../types/proposal.types";

export const getProposals = async (
    page: number,
    limit: number,
    search?: string
  ) => {
    const response = await apiService.get<GetProposalsResponse>(
      "proposal/proposals",
      {
        params: {
          page,
          limit,
          search,
        },
      }
    );
  
    return response.data;
  };

  export const addProposal = async (proposal: ProposalPayload) => {
    const response = await apiService.post("proposal/", proposal);
    return response;
  };