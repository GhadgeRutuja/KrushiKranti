export type Role = 'farmer' | 'wholesaler' | 'user' | 'admin' | 'delivery';

export interface User {
  id: string | number;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
}

// Backend login response structure
export interface LoginApiResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface RegisterResponse {
  message: string;
  email: string;
}

export interface OtpVerifyRequest {
  email: string;
  otp: string;
}

export interface OtpVerifyResponse {
  message: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface ResendOtpResponse {
  message: string;
}

// Forgot Password types
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface VerifyResetOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyResetOtpResponse {
  success: boolean;
  message: string;
  resetToken?: string;
}

export interface ResetPasswordRequest {
  email: string;
  resetToken: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface UpdateAdminPasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateAdminPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}
