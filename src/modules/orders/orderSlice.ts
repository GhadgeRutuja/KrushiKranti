import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Order, OrderStatus } from "./types";
import { orderService, type CreateMultiOrderData } from "./orderService";
import { getThunkErrorMessage } from "../../utils/errorHandler";

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  filters: {
    status: OrderStatus | "all";
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
  filters: {
    status: "all",
  },
  pagination: {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (
    {
      status,
      page,
      limit,
    }: { status: OrderStatus | "all"; page: number; limit: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await orderService.getUserOrders(page, limit, status);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const fetchFarmerOrders = createAsyncThunk(
  "orders/fetchFarmerOrders",
  async (
    {
      status,
      page,
      limit,
    }: { status: OrderStatus | "all"; page: number; limit: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await orderService.getFarmerOrders(page, limit, status);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (data: CreateMultiOrderData, { rejectWithValue }) => {
    try {
      // Use multi-item order function which creates one order per item
      const order = await orderService.createMultiItemOrders(data);
      return order;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const cancelOrder = createAsyncThunk(
  "orders/cancelOrder",
  async (id: string, { rejectWithValue }) => {
    try {
      const order = await orderService.cancelOrder(id);
      return order;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async (
    { orderId, status }: { orderId: string; status: OrderStatus },
    { rejectWithValue },
  ) => {
    try {
      const order = await orderService.updateOrderStatus({ orderId, status });
      return order;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const fetchOrderById = createAsyncThunk(
  "orders/fetchOrderById",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const order = await orderService.getOrderById(orderId);
      return order;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<{ status: OrderStatus | "all" }>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = getThunkErrorMessage(action, "Unable to load your orders");
      })
      // Fetch farmer orders
      .addCase(fetchFarmerOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFarmerOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchFarmerOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = getThunkErrorMessage(action, "Unable to load farmer orders");
      })
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = getThunkErrorMessage(action, "Unable to place order");
      })
      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = getThunkErrorMessage(action, "Order cancellation failed");
      })
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = getThunkErrorMessage(action, "Unable to update order status");
      })
      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = getThunkErrorMessage(action, "Unable to load order details");
      });
  },
});

export const { setFilters, setPage, clearSelectedOrder, clearError } =
  orderSlice.actions;
export default orderSlice.reducer;
