// api/auth.ts

import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  User,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  VerifyOtpRequest,
  ResetPasswordRequest,
  ResendVerifyEmailRequest,
  ResendVerifyEmailResponse,
  ApiResponse,
} from '../types/api';

// Auth API functions
export const authApi = {
  login: (data: LoginRequest) => 
    apiClient.post<LoginResponse>('/api/v1/auth/login', data),
  
  signup: (data: SignupRequest) => 
    apiClient.post<User>('/api/v1/auth/signup', data),
  
  forgotPassword: (data: ForgotPasswordRequest) => 
    apiClient.post<ForgotPasswordResponse>('/api/v1/auth/forgot-password', data),
  
  validateForgotPasswordOtp: (data: VerifyOtpRequest) => 
    apiClient.post('/api/v1/auth/validate-forgot-password-otp', data),
  
  resetPassword: (data: ResetPasswordRequest) => 
    apiClient.post('/api/v1/auth/reset-password', data),
  
  verifyEmail: (data: VerifyOtpRequest) => 
    apiClient.post('/api/v1/auth/verify-email', data),
  
  resendVerifyEmail: (data: ResendVerifyEmailRequest) => 
    apiClient.post<ResendVerifyEmailResponse>('/api/v1/auth/resend-verify-email', data),
  
  googleAuth: () => 
    apiClient.get('/api/v1/auth/google'),
  
  googleCallback: () => 
    apiClient.get<LoginResponse>('/api/v1/auth/google/callback'),
  
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
    }>('/api/v1/auth/google/signin', { accessToken }),
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
        localStorage.setItem('accessToken', response.data.accessToken);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
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

// createdAt
// : 
// "2025-08-08T04:54:59.963Z"
// email
// : 
// "okaforhenry01@gmail.com"
// firstName
// : 
// "Henry"
// id
// : 
// "6895832363e1a0eb368de2e2"
// isEmailVerified
// : 
// false
// isPhoneVerified
// : 
// false
// isTwoFactorAuthEnabled
// : 
// false
// kycCompleted
// : 
// false
// lastName
// : 
// "Okafor"
// roles
// : 
// ["user"]
// status
// : 
// "active"
// updatedAt
// : 
// "2025-08-08T04:54:59.963Z"
// username
// : 
// "okaforhenry01@gmail.com"
// verificationToken
// : 
// "448240"