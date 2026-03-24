import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type {
  AdminUser,
  AdminProduct,
  AdminStats,
  UserGrowthData,
  RevenueData,
  CommissionData,
  ActivityLog,
  FraudAlert,
  CitySalesData,
  TopFarmerData
} from './types';

interface AdminState {
  users: AdminUser[];
  products: AdminProduct[];
  stats: AdminStats;
  userGrowthData: UserGrowthData[];
  revenueData: RevenueData[];
  commissions: CommissionData[];
  activityLogs: ActivityLog[];
  fraudAlerts: FraudAlert[];
  citySalesData: CitySalesData[];
  topFarmers: TopFarmerData[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

// Mock data
const mockUsers: AdminUser[] = [
  { id: '1', name: 'Ramesh Kumar', email: 'ramesh@example.com', role: 'farmer', status: 'active', createdAt: '2024-01-10', lastLogin: '2024-01-25' },
  { id: '2', name: 'Suresh Patel', email: 'suresh@example.com', role: 'farmer', status: 'active', createdAt: '2024-01-12', lastLogin: '2024-01-24' },
  { id: '3', name: 'Vikram Wholesale', email: 'vikram@wholesale.com', role: 'wholesaler', status: 'active', createdAt: '2024-01-05', lastLogin: '2024-01-25' },
  { id: '4', name: 'Priya Singh', email: 'priya@example.com', role: 'user', status: 'active', createdAt: '2024-01-15', lastLogin: '2024-01-23' },
];

const mockProducts: AdminProduct[] = [
  { id: '1', name: 'Organic Tomatoes', category: 'vegetables', farmerName: 'Ramesh Kumar', farmerId: '1', retailPrice: 60, wholesalePrice: 45, stock: 500, unit: 'kg', image: 'https://images.unsplash.com/photo-1546473427-e1ad00490b6a?w=400', approvalStatus: 'pending', createdAt: '2024-01-20' },
  { id: '2', name: 'Fresh Spinach', category: 'vegetables', farmerName: 'Suresh Patel', farmerId: '2', retailPrice: 40, wholesalePrice: 30, stock: 200, unit: 'kg', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400', approvalStatus: 'approved', createdAt: '2024-01-18' },
];

const mockStats: AdminStats = {
  totalUsers: 1250,
  totalFarmers: 320,
  totalWholesalers: 85,
  totalProducts: 2450,
  totalRevenue: 12500000,
  pendingApprovals: 24,
};

const mockUserGrowthData: UserGrowthData[] = [
  { month: 'Jan', users: 150, farmers: 45, wholesalers: 12 },
  { month: 'Feb', users: 180, farmers: 52, wholesalers: 15 },
  { month: 'Mar', users: 220, farmers: 58, wholesalers: 18 },
  { month: 'Apr', users: 280, farmers: 65, wholesalers: 22 },
  { month: 'May', users: 350, farmers: 78, wholesalers: 28 },
  { month: 'Jun', users: 420, farmers: 92, wholesalers: 35 },
];

const mockRevenueData: RevenueData[] = [
  { month: 'Jan', revenue: 850000 },
  { month: 'Feb', revenue: 920000 },
  { month: 'Mar', revenue: 1100000 },
  { month: 'Apr', revenue: 1350000 },
  { month: 'May', revenue: 1580000 },
  { month: 'Jun', revenue: 1820000 },
];

const mockCommissions: CommissionData[] = [
  { id: 'c1', orderId: 'ORD-101', orderAmount: 5000, commissionAmount: 250, farmerName: 'Ramesh Kumar', date: '2024-01-25' },
  { id: 'c2', orderId: 'ORD-102', orderAmount: 12000, commissionAmount: 600, farmerName: 'Suresh Patel', date: '2024-01-24' },
  { id: 'c3', orderId: 'ORD-103', orderAmount: 3500, commissionAmount: 175, farmerName: 'Mahesh Yadav', date: '2024-01-24' },
];

const mockActivityLogs: ActivityLog[] = [
  { id: 'l1', adminId: 'adm1', adminName: 'Super Admin', action: 'Banned User', target: 'Priya Singh', timestamp: new Date().toISOString() },
  { id: 'l2', adminId: 'adm1', adminName: 'Super Admin', action: 'Approved Product', target: 'Fresh Spinach', timestamp: new Date().toISOString() },
  { id: 'l3', adminId: 'adm2', adminName: 'Moderator', action: 'Rejected Product', target: 'Low Quality Tomatoes', timestamp: new Date().toISOString() },
];

const mockFraudAlerts: FraudAlert[] = [
  { id: 'f1', type: 'suspicious_pricing', severity: 'high', message: 'Tomatoes priced at ₹500/kg (Market avg: ₹40)', targetId: 'p1', targetName: 'Expensive Tomatoes', timestamp: new Date().toISOString(), status: 'pending' },
  { id: 'f2', type: 'abnormal_transaction', severity: 'medium', message: 'User Priya Singh made 10 transactions in 1 minute', targetId: 'u4', targetName: 'Priya Singh', timestamp: new Date().toISOString(), status: 'pending' },
];

const mockCitySalesData: CitySalesData[] = [
  { name: 'Mumbai', value: 4500000 },
  { name: 'Pune', value: 3200000 },
  { name: 'Nashik', value: 2100000 },
  { name: 'Nagpur', value: 1500000 },
  { name: 'Aurangabad', value: 1200000 },
];

const mockTopFarmers: TopFarmerData[] = [
  { name: 'Ramesh Kumar', sales: 450, revenue: 125000, rating: 4.8 },
  { name: 'Suresh Patel', sales: 380, revenue: 98000, rating: 4.6 },
  { name: 'Mahesh Yadav', sales: 310, revenue: 85000, rating: 4.7 },
  { name: 'Prakash Deshmukh', sales: 290, revenue: 76000, rating: 4.9 },
];

const initialState: AdminState = {
  users: [],
  products: [],
  stats: {
    totalUsers: 0,
    totalFarmers: 0,
    totalWholesalers: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
  },
  userGrowthData: [],
  revenueData: [],
  commissions: [],
  activityLogs: [],
  fraudAlerts: [],
  citySalesData: [],
  topFarmers: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
};

export const fetchAdminStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        stats: mockStats,
        userGrowthData: mockUserGrowthData,
        revenueData: mockRevenueData,
        commissions: mockCommissions,
        activityLogs: mockActivityLogs,
        fraudAlerts: mockFraudAlerts,
        citySalesData: mockCitySalesData,
        topFarmers: mockTopFarmers,
      };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockUsers;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchAdminProducts = createAsyncThunk(
  'admin/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockProducts;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    resolveFraudAlert: (state, action: PayloadAction<string>) => {
      const alert = state.fraudAlerts.find(a => a.id === action.payload);
      if (alert) alert.status = 'resolved';
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats;
        state.userGrowthData = action.payload.userGrowthData;
        state.revenueData = action.payload.revenueData;
        state.commissions = action.payload.commissions;
        state.activityLogs = action.payload.activityLogs;
        state.fraudAlerts = action.payload.fraudAlerts;
        state.citySalesData = action.payload.citySalesData;
        state.topFarmers = action.payload.topFarmers;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.products = action.payload;
      });
  },
});

export const { resolveFraudAlert, clearError } = adminSlice.actions;
export default adminSlice.reducer;
