import apiService from "../../services";
import { MonthlyRevenueInput, GetMonthlyRevenue, SubscriptionStats, OpenTicketsByPriority } from "../types/home.types";
export const getOpenTicketsByPriority = async () => {
    
  const response = await apiService.get<OpenTicketsByPriority>('/ticket/opentickets/priority');
  return response;
};

export const getMonthlyRevenue = async (input: MonthlyRevenueInput) => {
  const response = await apiService.get<GetMonthlyRevenue>('/payment/revenue/monthly', { params: input });
  return response;
};

export const getSubscriptionStats = async () => {
  const response = await apiService.get<SubscriptionStats>('/subscription/all/active');
  return response;
};

