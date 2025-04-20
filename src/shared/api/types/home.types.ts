// ------------------------------------------------------------
// Open Tickets by Priority
// ------------------------------------------------------------
export interface OpenTicketsByPriorityResponse {
  data: OpenTicketsByPriority;
  status: number;
  statusText: string;
}

export interface OpenTicketsByPriority {
  openTicketsByPriority: OpenTicketsCount[];
  totalOpenTickets: number;
}

export interface OpenTicketsCount {
  _id: string;
  count: number;
}

// ------------------------------------------------------------
// Monthly Revenue
// ------------------------------------------------------------
export interface MonthlyRevenueInput {
  year: number;
  month: number;
}

export interface MonthlyRevenueResponse {
  data: GetMonthlyRevenue;
  status: number;
  statusText: string;
}

export interface GetMonthlyRevenue {
    monthlyRevenue: number;
  }

// ------------------------------------------------------------
// Subscription Stats
// ------------------------------------------------------------
export interface SubscriptionStatsResponse {
  data: SubscriptionStats;
  status: number;
  statusText: string;
}

export interface SubscriptionStats {
  active: number;
  cancelled: number;
  inactive: number;
  processing: number;
  expired: number;
}
  