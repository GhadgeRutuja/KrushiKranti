import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { BulkRequest, InventoryItem, WholesalerStats } from './types';
import api from '../../services/api';

// ── Backend response shape (BulkOrderResponse) ──────────────────────────────
interface BulkOrderBackend {
  id: number;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  deliveryStatus: string;
  farmerId: number;
  farmerName: string;
  wholesalerId: number;
  wholesalerName: string;
  shipmentId?: string;
  awbCode?: string;
  courierName?: string;
  createdAt: string;
  updatedAt: string;
}

interface WholesalerState {
  requests: BulkRequest[];
  inventory: InventoryItem[];
  stats: WholesalerStats;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function mapOrderToRequest(order: BulkOrderBackend): BulkRequest {
  let status: 'pending' | 'approved' | 'rejected' = 'pending';
  if (order.orderStatus === 'CONFIRMED' || order.paymentStatus === 'PAID') status = 'approved';
  else if (order.orderStatus === 'CANCELLED') status = 'rejected';
  return {
    id: String(order.id),
    productId: String(order.id),
    productName: order.productName,
    productImage: '',
    farmerId: String(order.farmerId),
    farmerName: order.farmerName,
    wholesalerId: String(order.wholesalerId),
    quantity: order.quantity,
    unit: 'kg',
    pricePerUnit: order.pricePerUnit ?? 0,
    totalPrice: order.totalAmount,
    status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

function mapOrderToInventory(order: BulkOrderBackend): InventoryItem {
  let stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock' = 'in-stock';
  if (order.deliveryStatus === 'RETURNED') stockStatus = 'out-of-stock';
  else if (order.quantity < 50) stockStatus = 'low-stock';
  return {
    id: String(order.id),
    productId: String(order.id),
    productName: order.productName,
    productImage: '',
    farmerName: order.farmerName,
    quantity: order.quantity,
    unit: 'kg',
    purchasePrice: order.totalAmount,
    purchaseDate: order.createdAt.substring(0, 10),
    status: stockStatus,
  };
}

// ── State ─────────────────────────────────────────────────────────────────────

const initialState: WholesalerState = {
  requests: [],
  inventory: [],
  stats: {
    totalRequests: 0,
    approvedOrders: 0,
    pendingRequests: 0,
    inventoryItems: 0,
    totalInventoryValue: 0,
  },
  isLoading: false,
  isSubmitting: false,
  error: null,
};

// ── Async thunks ──────────────────────────────────────────────────────────────

export const fetchWholesalerStats = createAsyncThunk(
  'wholesaler/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/bulk-payments/orders');
      const orders: BulkOrderBackend[] = res.data?.data ?? res.data ?? [];
      const stats: WholesalerStats = {
        totalRequests: orders.length,
        approvedOrders: orders.filter(
          (o) => o.orderStatus === 'CONFIRMED' || o.paymentStatus === 'PAID'
        ).length,
        pendingRequests: orders.filter((o) => o.orderStatus === 'PENDING').length,
        inventoryItems: orders.filter(
          (o) => o.deliveryStatus === 'DELIVERED' || o.deliveryStatus === 'IN_TRANSIT'
        ).length,
        totalInventoryValue: orders
          .filter((o) => o.paymentStatus === 'PAID')
          .reduce((sum, o) => sum + Number(o.totalAmount), 0),
      };
      return stats;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchRequests = createAsyncThunk(
  'wholesaler/fetchRequests',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/bulk-payments/orders');
      const orders: BulkOrderBackend[] = res.data?.data ?? res.data ?? [];
      return orders.map(mapOrderToRequest);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchInventory = createAsyncThunk(
  'wholesaler/fetchInventory',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/bulk-payments/orders');
      const orders: BulkOrderBackend[] = res.data?.data ?? res.data ?? [];
      return orders
        .filter((o) => o.deliveryStatus === 'DELIVERED' || o.deliveryStatus === 'IN_TRANSIT')
        .map(mapOrderToInventory);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const sendBulkRequest = createAsyncThunk(
  'wholesaler/sendBulkRequest',
  async (
    _payload: {
      productId: string;
      productName: string;
      productImage: string;
      farmerName: string;
      quantity: number;
      unit: string;
      pricePerUnit: number;
    },
    { rejectWithValue }
  ) => {
    return rejectWithValue('Use the negotiation flow to place bulk orders.');
  }
);

export const approveRequest = createAsyncThunk(
  'wholesaler/approveRequest',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.post('/negotiations/deal/respond', { dealOfferId: Number(id), action: 'ACCEPT' });
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const rejectRequest = createAsyncThunk(
  'wholesaler/rejectRequest',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.post('/negotiations/deal/respond', { dealOfferId: Number(id), action: 'REJECT' });
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const wholesalerSlice = createSlice({
  name: 'wholesaler',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch stats
      .addCase(fetchWholesalerStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchWholesalerStats.fulfilled, (state, action: PayloadAction<WholesalerStats>) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchWholesalerStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch requests
      .addCase(fetchRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action: PayloadAction<BulkRequest[]>) => {
        state.isLoading = false;
        state.requests = action.payload;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch inventory
      .addCase(fetchInventory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action: PayloadAction<InventoryItem[]>) => {
        state.isLoading = false;
        state.inventory = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Send bulk request
      .addCase(sendBulkRequest.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(sendBulkRequest.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      // Approve request
      .addCase(approveRequest.fulfilled, (state, action: PayloadAction<string>) => {
        const request = state.requests.find((r) => r.id === action.payload);
        if (request) {
          request.status = 'approved';
          request.updatedAt = new Date().toISOString();
        }
      })
      // Reject request
      .addCase(rejectRequest.fulfilled, (state, action: PayloadAction<string>) => {
        const request = state.requests.find((r) => r.id === action.payload);
        if (request) {
          request.status = 'rejected';
          request.updatedAt = new Date().toISOString();
        }
      });
  },
});

export const { clearError } = wholesalerSlice.actions;
export default wholesalerSlice.reducer;
