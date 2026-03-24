import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { User, LoginCredentials, RegisterData, Role, OtpVerifyRequest, ResendOtpRequest } from './types';
import { authService } from './authService';

interface AuthState {
  user: User | null;
  token: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // OTP verification states
  registerLoading: boolean;
  otpLoading: boolean;
  otpVerified: boolean;
  otpError: string | null;
  pendingVerificationEmail: string | null;
  // Forgot password states
  resetEmail: string | null;
  resetToken: string | null;
  resetOtpVerified: boolean;
  resetLoading: boolean;
  resetError: string | null;
  resetSuccess: boolean;
  // Admin creation states
  adminCreateLoading: boolean;
  adminCreateError: string | null;
  // Admin password update states
  adminPasswordUpdateLoading: boolean;
  adminPasswordUpdateSuccess: boolean;
  adminPasswordUpdateError: string | null;
}

const getInitialAuthState = (): AuthState => {
  const storedUser = authService.getStoredUser();
  const storedToken = authService.getStoredToken();

  return {
    user: storedUser,
    token: storedToken,
    role: storedUser?.role || null,
    isAuthenticated: !!storedToken,
    isLoading: false,
    error: null,
    // OTP verification states
    registerLoading: false,
    otpLoading: false,
    otpVerified: false,
    otpError: null,
    pendingVerificationEmail: null,
    // Forgot password states
    resetEmail: null,
    resetToken: null,
    resetOtpVerified: false,
    resetLoading: false,
    resetError: null,
    resetSuccess: false,
    // Admin creation states
    adminCreateLoading: false,
    adminCreateError: null,
    // Admin password update states
    adminPasswordUpdateLoading: false,
    adminPasswordUpdateSuccess: false,
    adminPasswordUpdateError: null,
  };
};

const initialState: AuthState = getInitialAuthState();

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      // authService.login() already stores auth data in localStorage
      const response = await authService.login(credentials);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authService.register(data);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (data: OtpVerifyRequest, { rejectWithValue }) => {
    try {
      const response = await authService.verifyOtp(data);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async (data: ResendOtpRequest, { rejectWithValue }) => {
    try {
      const response = await authService.resendOtp(data);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createAdmin = createAsyncThunk(
  'auth/createAdmin',
  async (data: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      return await authService.createAdmin(data);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateAdminPassword = createAsyncThunk(
  'auth/updateAdminPassword',
  async (
    data: { currentPassword: string; newPassword: string },
    { rejectWithValue },
  ) => {
    try {
      return await authService.updateAdminPassword(data);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email);
      return { ...response, email };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const verifyResetOtp = createAsyncThunk(
  'auth/verifyResetOtp',
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyResetOtp(email, otp);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email, resetToken, newPassword }: { email: string; resetToken: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(email, resetToken, newPassword);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.adminCreateError = null;
      state.adminPasswordUpdateError = null;
    },
    clearOtpError: (state) => {
      state.otpError = null;
    },
    setPendingVerificationEmail: (state, action: PayloadAction<string | null>) => {
      state.pendingVerificationEmail = action.payload;
    },
    resetOtpState: (state) => {
      state.otpLoading = false;
      state.otpVerified = false;
      state.otpError = null;
      state.pendingVerificationEmail = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.role = action.payload.role;
      state.isAuthenticated = true;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    clearResetError: (state) => {
      state.resetError = null;
    },
    resetPasswordState: (state) => {
      state.resetEmail = null;
      state.resetToken = null;
      state.resetOtpVerified = false;
      state.resetLoading = false;
      state.resetError = null;
      state.resetSuccess = false;
    },
    resetAdminPasswordUpdateState: (state) => {
      state.adminPasswordUpdateLoading = false;
      state.adminPasswordUpdateSuccess = false;
      state.adminPasswordUpdateError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.adminCreateError = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.user.role;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.registerLoading = true;
        state.error = null;
        state.adminCreateError = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.registerLoading = false;
        state.pendingVerificationEmail = action.payload.email;
      })
      .addCase(register.rejected, (state, action) => {
        state.registerLoading = false;
        state.error = action.payload as string;
      })
      // OTP Verification
      .addCase(verifyOtp.pending, (state) => {
        state.otpLoading = true;
        state.otpError = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.otpLoading = false;
        state.otpVerified = true;
        state.pendingVerificationEmail = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpError = action.payload as string;
      })
      // Resend OTP
      .addCase(resendOtp.pending, (state) => {
        state.otpLoading = true;
        state.otpError = null;
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.otpLoading = false;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpError = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.role = null;
        state.isAuthenticated = false;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.resetLoading = true;
        state.resetError = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.resetLoading = false;
        state.resetEmail = action.payload.email;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.resetLoading = false;
        state.resetError = action.payload as string;
      })
      // Verify Reset OTP
      .addCase(verifyResetOtp.pending, (state) => {
        state.resetLoading = true;
        state.resetError = null;
      })
      .addCase(verifyResetOtp.fulfilled, (state, action) => {
        state.resetLoading = false;
        state.resetOtpVerified = true;
        state.resetToken = action.payload.resetToken || null;
      })
      .addCase(verifyResetOtp.rejected, (state, action) => {
        state.resetLoading = false;
        state.resetError = action.payload as string;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.resetLoading = true;
        state.resetError = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.resetLoading = false;
        state.resetSuccess = true;
        // Clear reset state after success
        state.resetEmail = null;
        state.resetToken = null;
        state.resetOtpVerified = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetLoading = false;
        state.resetError = action.payload as string;
      })
      // Create Admin
      .addCase(createAdmin.pending, (state) => {
        state.adminCreateLoading = true;
        state.error = null;
        state.adminCreateError = null;
      })
      .addCase(createAdmin.fulfilled, (state) => {
        state.adminCreateLoading = false;
        state.adminCreateError = null;
      })
      .addCase(createAdmin.rejected, (state, action) => {
        state.adminCreateLoading = false;
        state.adminCreateError = action.payload as string;
      })
      // Update Admin Password
      .addCase(updateAdminPassword.pending, (state) => {
        state.adminPasswordUpdateLoading = true;
        state.adminPasswordUpdateSuccess = false;
        state.adminPasswordUpdateError = null;
      })
      .addCase(updateAdminPassword.fulfilled, (state) => {
        state.adminPasswordUpdateLoading = false;
        state.adminPasswordUpdateSuccess = true;
        state.adminPasswordUpdateError = null;
      })
      .addCase(updateAdminPassword.rejected, (state, action) => {
        state.adminPasswordUpdateLoading = false;
        state.adminPasswordUpdateSuccess = false;
        state.adminPasswordUpdateError = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearOtpError,
  setPendingVerificationEmail,
  resetOtpState,
  setUser,
  setToken,
  clearResetError,
  resetPasswordState,
  resetAdminPasswordUpdateState,
} = authSlice.actions;
export default authSlice.reducer;
