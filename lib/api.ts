// lib/api.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { ApiResponse } from "../types/api";
import { toast } from "sonner";

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Flag to prevent multiple toast notifications
let hasShownUnauthorizedToast = false;

// Function to reset the unauthorized flag (call this on successful login)
export const resetUnauthorizedFlag = () => {
  hasShownUnauthorizedToast = false;
};

// Function to handle 401 errors - clears auth state, components react accordingly
export const handleUnauthorized = () => {
  if (typeof window !== "undefined") {
    // Clear all auth-related data from localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("auth-store");
    localStorage.removeItem("user");

    // Dispatch custom event to notify auth hooks to clear in-memory state
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));

    // Show toast only once per session
    if (!hasShownUnauthorizedToast) {
      hasShownUnauthorizedToast = true;
      toast.error("Session expired. Please sign in again.");
    }
  }
};

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Initialize token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("accessToken");
    }

    // Set up request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Set up response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response.data;
      },
      (error: any) => {
        console.error("API request failed:", error);

        // Create a custom error object that preserves all important data
        const customError = new Error();

        if (error.response) {
          // Server responded with error status
          const { data, status } = error.response;

          // Handle 401 Unauthorized - redirect to login
          if (status === 401) {
            // Clear auth data and redirect
            this.setToken(null);
            handleUnauthorized();
            // Return early to prevent further processing
            return Promise.reject(
              new Error("Unauthorized - Please sign in")
            );
          }

          // Set the error message from the response
          if (data?.message) {
            if (Array.isArray(data.message)) {
              customError.message = data.message[0];
            } else {
              customError.message = data.message;
            }
          } else if (data?.error) {
            customError.message = data.error;
          } else if (typeof data === "string") {
            customError.message = data;
          } else {
            customError.message = `Request failed with status code ${status}`;
          }

          // Preserve all the important error data you need
          (customError as any).status = status;
          (customError as any).data = data;
          (customError as any).errorCode = data?.errorCode;
          (customError as any).requestMethod = data?.requestMethod;
          (customError as any).requestPath = data?.requestPath;
        } else if (error.request) {
          // Network error
          customError.message = "Network error - no response received";
          (customError as any).status = null;
          (customError as any).data = null;
        } else {
          // Something else happened
          customError.message = error.message || "An unexpected error occurred";
          (customError as any).status = null;
          (customError as any).data = null;
        }

        // Preserve the original error for debugging
        (customError as any).originalError = error;

        return Promise.reject(customError);
      }
    );
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("accessToken", token);
      } else {
        localStorage.removeItem("accessToken");
      }
    }
  }

  async get<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.client.get(endpoint, config);
  }

  async post<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.client.post(endpoint, data, config);
  }

  async put<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.client.put(endpoint, data, config);
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.client.patch(endpoint, data, config);
  }

  async delete<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.client.delete(endpoint, config);
  }
}

export const apiClient = new ApiClient(BASE_URL);
