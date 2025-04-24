import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.REACT_APP_BASE_URL,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    // Optionally add interceptors for auth, logging, etc.
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Centralized error handling
        if (error.response) {
          // Server responded with a status other than 2xx
          console.error('API Error:', error.response.data);
          return Promise.reject(error.response.data);
        } else if (error.request) {
          // No response received
          console.error('Network Error:', error.message);
          return Promise.reject({ message: 'Network error. Please try again.' });
        } else {
          // Something else happened
          console.error('Error:', error.message);
          return Promise.reject({ message: error.message });
        }
      }
    );
  }

  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }
}

const apiService = new ApiService();
export default apiService;
