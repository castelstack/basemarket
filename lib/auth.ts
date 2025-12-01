// api/auth.ts

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import {
  ApiResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ResendVerifyEmailRequest,
  ResendVerifyEmailResponse,
  ResetPasswordRequest,
  SignupRequest,
  User,
  VerifyOtpRequest,
  WalletMessageRequest,
  WalletMessageResponse,
  WalletNonceRequest,
  WalletNonceResponse,
  WalletSignInRequest,
  WalletSignInResponse,
} from "../types/api";

// Auth API functions
export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>("/api/v1/auth/", data),

  signup: (data: SignupRequest) =>
    apiClient.post<User>("/api/v1/auth/signup", data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post<ForgotPasswordResponse>(
      "/api/v1/auth/forgot-password",
      data
    ),

  validateForgotPasswordOtp: (data: VerifyOtpRequest) =>
    apiClient.post("/api/v1/auth/validate-forgot-password-otp", data),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post("/api/v1/auth/reset-password", data),

  verifyEmail: (data: VerifyOtpRequest) =>
    apiClient.post("/api/v1/auth/verify-email", data),

  resendVerifyEmail: (data: ResendVerifyEmailRequest) =>
    apiClient.post<ResendVerifyEmailResponse>(
      "/api/v1/auth/resend-verify-email",
      data
    ),

  googleAuth: () => apiClient.get("/api/v1/auth/google"),

  googleCallback: () =>
    apiClient.get<LoginResponse>("/api/v1/auth/google/callback"),

  verifyGoogleToken: (accessToken: string) =>
    apiClient.post<{
      accessToken: string;
      user: {
        id: string;
        username: string;
        email: string;
        roles: string[];
        walletAddress?: string;
        firstName?: string;
        lastName?: string;
      };
      isNewUser?: boolean;
    }>("/api/v1/auth/google/signin", { accessToken }),

  // Wallet Authentication
  getWalletNonce: (data: WalletNonceRequest) =>
    apiClient.post<WalletNonceResponse>("/api/v1/auth/wallet/nonce", data),

  getWalletMessage: (data: WalletMessageRequest) =>
    apiClient.post<WalletMessageResponse>("/api/v1/auth/wallet/message", data),

  walletSignIn: (data: WalletSignInRequest) =>
    apiClient.post<WalletSignInResponse>("/api/v1/auth/wallet/signin", data),

  // Token Management
  refreshToken: (data: RefreshTokenRequest) =>
    apiClient.post<RefreshTokenResponse>("/api/v1/auth/refresh", data),

  logout: (data: LogoutRequest) => apiClient.post("/api/v1/auth/logout", data),
};

// Auth hooks
export const useLogin = () => {
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (response: ApiResponse<LoginResponse>) => {
      if (response.data?.accessToken) {
        apiClient.setToken(response.data.accessToken);
      }
    },
  });
};

export const useSignup = () => {
  return useMutation({
    mutationFn: authApi.signup,
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authApi.forgotPassword,
  });
};

export const useValidateForgotPasswordOtp = () => {
  return useMutation({
    mutationFn: authApi.validateForgotPasswordOtp,
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: authApi.resetPassword,
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: authApi.verifyEmail,
  });
};

export const useResendVerifyEmail = () => {
  return useMutation({
    mutationFn: authApi.resendVerifyEmail,
  });
};

export const useVerifyGoogleToken = () => {
  return useMutation({
    mutationFn: authApi.verifyGoogleToken,
    onSuccess: (response: any) => {
      if (response.data?.accessToken) {
        apiClient.setToken(response.data.accessToken);
        localStorage.setItem("accessToken", response.data.accessToken);
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
      }
    },
  });
};

export const useGoogleCallback = () => {
  return useMutation({
    mutationFn: authApi.googleCallback,
    onSuccess: (response: ApiResponse<LoginResponse>) => {
      if (response.data?.accessToken) {
        apiClient.setToken(response.data.accessToken);
      }
    },
  });
};

// Wallet Authentication Hooks
export const useGetWalletNonce = () => {
  return useMutation({
    mutationFn: authApi.getWalletNonce,
  });
};

export const useGetWalletMessage = () => {
  return useMutation({
    mutationFn: authApi.getWalletMessage,
  });
};

export const useWalletSignIn = () => {
  return useMutation({
    mutationFn: authApi.walletSignIn,
    onSuccess: (response: ApiResponse<WalletSignInResponse>) => {
      if (response.data?.accessToken) {
        apiClient.setToken(response.data.accessToken);
        localStorage.setItem("accessToken", response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken);
        }
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
      }
    },
  });
};

// Token Management Hooks
export const useRefreshToken = () => {
  return useMutation({
    mutationFn: authApi.refreshToken,
    onSuccess: (response: ApiResponse<RefreshTokenResponse>) => {
      if (response.data?.accessToken) {
        apiClient.setToken(response.data.accessToken);
        localStorage.setItem("accessToken", response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken);
        }
      }
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      apiClient.setToken(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    },
  });
};
