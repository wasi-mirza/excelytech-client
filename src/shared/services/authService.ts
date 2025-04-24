import apiService from "./index"; // Your Axios wrapper

export const loginUser = async (email: string, password: string) => {
  return apiService.post("/user/login", { email, password });
};

export const logUserActivity = async (userId: string, activityType: string, description: string, ip: string, browserInfo: string, token: string) => {
  return apiService.post(
    "/useractivity/",
    {
      userId,
      activityType,
      description,
      ipAddress: ip,
      userAgent: browserInfo,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};
