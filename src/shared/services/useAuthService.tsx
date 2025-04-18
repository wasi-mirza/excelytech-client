// src/services/useAuthService.js
import { useState } from "react";
import apiService from "./index.ts";

export const useAuthService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loginUser = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.post("/user/login", { email, password });
      setLoading(false);
      return response;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { loginUser, loading, error };
};