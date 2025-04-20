import apiService from "../../services";
import { User } from "../types/user.types";
import { UserActivity } from "../types/user.types";
import { getPublicIp } from "../../utils/commonUtils";

export const logUserActivity = async (userActivity: UserActivity) => {
    const ipAddress = await getPublicIp();
    const browserInfo = navigator.userAgent;
    return apiService.post(
      "/useractivity/",
      {
        userId: userActivity.userId,
        activityType: userActivity.activityType,
        description: userActivity.description,
        ipAddress: ipAddress,
        browserInfo: browserInfo,
      }
    );
  };

  
export const getUsers = async () => {
    const response = await apiService.get<User[]>('/user/admin');
    return response;
};