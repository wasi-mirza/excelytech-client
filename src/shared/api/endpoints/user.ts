import apiService from "../../services";
import { User } from "../types/user.types";
import { UserActivity } from "../types/user.types";
import { getPublicIp } from "../../utils/commonUtils";

export const logUserActivity = async (userActivity: UserActivity) => {
    const ipAddress = await getPublicIp();
    // TODO NEED TO REMOVE THIS LATER... ONLY FOR TESTING
    function generateRandomIP() {
      const octet = () => Math.floor(Math.random() * 256);
      return `${octet()}.${octet()}.${octet()}.${octet()}`;
    }
    const randomIP = generateRandomIP();
    console.log("ipAddress", ipAddress);
    // ducplicate the ipaddress or send any random ipaddress
    const browserInfo = navigator.userAgent;
    return apiService.post(
      "/useractivity/",
      {
        userId: userActivity.userId,
        activityType: userActivity.activityType,
        description: userActivity.description,
        ipAddress: randomIP,
        browserInfo: browserInfo,
      }
    );
  };

  
export const getUsers = async () => {
    const response = await apiService.get<User[]>('/user/admin');
    return response;
};