import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
  RegisterResponse,
  OtpVerifyRequest,
  OtpVerifyResponse,
  ResendOtpRequest,
  ResendOtpResponse,
  LoginApiResponse,
  ForgotPasswordResponse,
  VerifyResetOtpResponse,
  ResetPasswordResponse,
  Role,
  UpdateAdminPasswordRequest,
  UpdateAdminPasswordResponse,
} from "./types";
import { googleLogout } from "@react-oauth/google";
import api from "../../services/api";
import { getErrorMessage } from "../../utils/errorHandler";

// Helper to convert backend role to frontend role
const normalizeRole = (backendRole: string): Role => {
  const roleRaw = String(backendRole ?? "").trim().toUpperCase();

  if (!roleRaw) return "user";
  if (roleRaw.includes("ADMIN")) return "admin";
  if (roleRaw.includes("FARMER")) return "farmer";
  if (roleRaw.includes("WHOLESALER") || roleRaw.includes("WHOLESELLER")) {
    return "wholesaler";
  }
  if (roleRaw.includes("DELIVERY")) return "delivery";
  if (roleRaw.includes("USER")) return "user";

  return "user";
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<{
        success: boolean;
        message: string;
        data: LoginApiResponse;
      }>("/auth/login", credentials);

      const loginData = response?.data?.data;
      if (!loginData) {
        throw new Error("Invalid login response");
      }

      // Transform backend response to frontend AuthResponse
      const user: User = {
        id: loginData.userId,
        email: loginData.email,
        name: `${loginData.firstName} ${loginData.lastName}`,
        firstName: loginData.firstName,
        lastName: loginData.lastName,
        role: normalizeRole(loginData.role),
      };

      const authData: AuthResponse = {
        user,
        token: loginData.accessToken,
        refreshToken: loginData.refreshToken,
      };

      // Store auth data on successful login
      this.setAuthData(authData.token, authData.user);
      return authData;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, "Unable to login. Please check your credentials."));
    }
  },

  async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      const payload: Record<string, string> = {
        firstName: data.name.split(" ")[0],
        lastName:
          data.name.split(" ").slice(1).join(" ") || data.name.split(" ")[0],
        email: data.email,
        password: data.password,
        role: `ROLE_${data.role.toUpperCase()}`,
      };
      if (data.phone) {
        payload.phone = data.phone;
      }
      const response = await api.post<{ data: string }>(
        "/auth/register",
        payload,
      );
      return {
        message: response.data.data,
        email: data.email,
      };
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, "Unable to create your account. Please try again."));
    }
  },

  async verifyOtp(data: OtpVerifyRequest): Promise<OtpVerifyResponse> {
    try {
      const response = await api.post<{ data: string }>(
        "/auth/verify-otp",
        data,
      );
      return { message: response.data.data };
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, "OTP verification failed. Please try again."));
    }
  },

  async resendOtp(data: ResendOtpRequest): Promise<ResendOtpResponse> {
    try {
      const response = await api.post<{ data: string }>(
        "/auth/resend-otp",
        data,
      );
      return { message: response.data.data };
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, "Unable to resend OTP right now."));
    }
  },

  async logout(): Promise<void> {
    googleLogout(); // Revoke Google session
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get<{ data: User }>("/auth/me");
      return response.data.data;
    } catch {
      // If API fails, try to get from localStorage
      return this.getStoredUser();
    }
  },

  getStoredToken(): string | null {
    return localStorage.getItem("token");
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  setAuthData(token: string, user: User): void {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    try {
      const response = await api.post<{
        success: boolean;
        message: string;
        data?: string;
      }>("/auth/forgot-password", { email });
      return {
        success: response.data.success,
        message:
          response.data.message ||
          response.data.data ||
          "OTP sent to your email",
      };
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, "Unable to send reset OTP."));
    }
  },

  async verifyResetOtp(
    email: string,
    otp: string,
  ): Promise<VerifyResetOtpResponse> {
    try {
      const response = await api.post<{
        success: boolean;
        message: string;
        data?: { resetToken: string };
      }>("/auth/verify-reset-otp", { email, otp });
      return {
        success: response.data.success,
        message: response.data.message,
        resetToken: response.data.data?.resetToken,
      };
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, "Invalid or expired OTP."));
    }
  },

  async resetPassword(
    email: string,
    resetToken: string,
    newPassword: string,
  ): Promise<ResetPasswordResponse> {
    try {
      const response = await api.post<{ success: boolean; message: string }>(
        "/auth/reset-password",
        {
          email,
          resetToken,
          newPassword,
        },
      );
      return {
        success: response.data.success,
        message: response.data.message || "Password reset successful",
      };
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, "Unable to reset password."));
    }
  },

  async createAdmin(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ message: string }> {
    try {
      const response = await api.post<{ data: string }>(
        "/auth/create-admin",
        data,
      );
      return { message: response.data.data || "Admin created successfully" };
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, "Unable to create admin account."));
    }
  },

  async updateAdminPassword(
    data: UpdateAdminPasswordRequest,
  ): Promise<UpdateAdminPasswordResponse> {
    try {
      const response = await api.put<{ success: boolean; message: string }>(
        "/admin/change-password",
        data,
      );
      return { message: response.data.message || "Password updated successfully" };
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, "Unable to update password."));
    }
  },
};
