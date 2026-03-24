import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { BulkProduct, BulkProductFormData } from "./types";
import * as bulkService from "./bulkService";

interface BulkState {
  products: BulkProduct[];
  myProducts: BulkProduct[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

const initialState: BulkState = {
  products: [],
  myProducts: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
};

export const fetchBulkProducts = createAsyncThunk(
  "bulk/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      return await bulkService.fetchBulkProducts();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const fetchMyBulkProducts = createAsyncThunk(
  "bulk/fetchMyProducts",
  async (_, { rejectWithValue }) => {
    try {
      return await bulkService.fetchMyBulkProducts();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const createBulkProduct = createAsyncThunk(
  "bulk/create",
  async (data: BulkProductFormData, { rejectWithValue }) => {
    try {
      return await bulkService.createBulkProduct(data);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const updateBulkProduct = createAsyncThunk(
  "bulk/update",
  async (
    { id, data }: { id: number; data: BulkProductFormData },
    { rejectWithValue },
  ) => {
    try {
      return await bulkService.updateBulkProduct(id, data);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const deleteBulkProduct = createAsyncThunk(
  "bulk/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await bulkService.deleteBulkProduct(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

const bulkSlice = createSlice({
  name: "bulk",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBulkProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchBulkProducts.fulfilled,
        (state, action: PayloadAction<BulkProduct[]>) => {
          state.isLoading = false;
          state.products = action.payload;
        },
      )
      .addCase(fetchBulkProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMyBulkProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchMyBulkProducts.fulfilled,
        (state, action: PayloadAction<BulkProduct[]>) => {
          state.isLoading = false;
          state.myProducts = action.payload;
        },
      )
      .addCase(fetchMyBulkProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createBulkProduct.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(
        createBulkProduct.fulfilled,
        (state, action: PayloadAction<BulkProduct>) => {
          state.isSubmitting = false;
          state.myProducts.unshift(action.payload);
        },
      )
      .addCase(createBulkProduct.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      .addCase(updateBulkProduct.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(
        updateBulkProduct.fulfilled,
        (state, action: PayloadAction<BulkProduct>) => {
          state.isSubmitting = false;
          const idx = state.myProducts.findIndex(
            (p) => p.id === action.payload.id,
          );
          if (idx !== -1) state.myProducts[idx] = action.payload;
        },
      )
      .addCase(updateBulkProduct.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      .addCase(deleteBulkProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        deleteBulkProduct.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.isLoading = false;
          state.myProducts = state.myProducts.filter(
            (p) => p.id !== action.payload,
          );
        },
      )
      .addCase(deleteBulkProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = bulkSlice.actions;
export default bulkSlice.reducer;
