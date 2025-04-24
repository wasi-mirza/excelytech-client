import { useState } from "react";
import apiService from "./index";
import { User } from "../api/types/user.types";

export const useUserService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.get<User[]>('/user/admin');
      setLoading(false);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
      throw err;
    }
  };

  return { getUsers, loading, error };
}; 