
export interface ProposalPayload {
  recipient: string | null;
  emailTo: string | null;
  title: string;
  content: string;
  products: ProposalProduct[];
  grandTotalCurrency: string;
  productTotal: number;
  grandTotal: number;
  discountOnGrandTotal: number;
  finalAmount: number;
  attachments: Attachment[];
  status: string;
}

export interface ProposalProduct {
    productId: string;
    currency: string;
    name: string;
    category: string;
    oldCost: number;
    newUpdatedCost: number;
    discountType: "Fixed" | "Percentage";
    quantity: number;
    discount: number;
    newTotalCost: number;
    newTax: number;
    newTotalCostWithTax: number;
  }

export interface Attachment {
  filename: string;
  path: string;
}

export interface ProposalPayloadResponse {
  recipient: string;
  emailTo: string;
  title: string;
  content: string;
  products: ProposalProduct[];
  grandTotalCurrency: string;
  productTotal: number;
  grandTotal: number;
  discountType: string;
  discountOnGrandTotal: number;
  finalAmount: number;
  status: string;
  ReSentProposalId: string;
  attachments: Attachment[];
  subscriptionOn: boolean;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}


// Get Proposal Payload
export interface GetProposalsResponse {
  total: number;
  page: number;
  totalPages: number;
  proposals: ProposalPayloadResponse[];
}