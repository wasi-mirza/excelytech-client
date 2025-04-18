import apiService from "./index.ts"; // Your Axios wrapper

export const loginUser = async (email, password) => {
  return apiService.post("/user/login", { email, password });
};

export const logUserActivity = async (userId, activityType, description, ip, browserInfo, token) => {
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
