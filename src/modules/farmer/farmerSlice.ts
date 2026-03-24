import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type {
  FarmerProduct,
  FarmerStats,
  RevenueData,
  ProductFormData,
} from "./types";
import { productService } from "../product/productService";
import type { CreateProductData } from "../product/productService";
import api from "../../services/api";

interface FarmerState {
  products: FarmerProduct[];
  stats: FarmerStats;
  revenueData: RevenueData[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

const defaultStats: FarmerStats = {
  totalProducts: 0,
  totalOrders: 0,
  totalRevenue: 0,
  pendingOrders: 0,
  completedOrders: 0,
  activeOrders: 0,
  topSellingProduct: "-",
};

const mockRevenueData: RevenueData[] = [
  { month: "Jan", revenue: 18500 },
  { month: "Feb", revenue: 22000 },
  { month: "Mar", revenue: 19800 },
  { month: "Apr", revenue: 28500 },
  { month: "May", revenue: 32000 },
  { month: "Jun", revenue: 27500 },
  { month: "Jul", revenue: 35000 },
  { month: "Aug", revenue: 31000 },
  { month: "Sep", revenue: 29000 },
  { month: "Oct", revenue: 38000 },
  { month: "Nov", revenue: 42000 },
  { month: "Dec", revenue: 45000 },
];

const initialState: FarmerState = {
  products: [],
  stats: { ...defaultStats },
  revenueData: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
};

/**
 * Transform a backend Product (from productService) into a FarmerProduct
 */
function toFarmerProduct(p: Record<string, unknown>): FarmerProduct {
  const images = Array.isArray(p.images) && p.images.length > 0
    ? (p.images as string[])
    : (p.imageUrl ? [p.imageUrl as string] : []);

  return {
    id: String(p.id ?? ""),
    name: (p.name as string) ?? "",
    description: (p.description as string) ?? "",
    category: (p.category as FarmerProduct["category"]) ?? "other",
    retailPrice: Number(p.retailPrice ?? 0),
    wholesalePrice: Number(p.wholesalePrice ?? 0),
    quantity: Number(p.quantity ?? p.stock ?? 0),
    unit: (p.unit as string) ?? "kg",
    images,
    organic: Boolean(p.organic),
    status: (p.status as string) ?? "ACTIVE",
    createdAt: (p.createdAt as string) ?? "",
    updatedAt: (p.updatedAt as string) ?? "",
  };
}

// ────────────────────────────────────────────
// Async thunks — NOW connected to real API
// ────────────────────────────────────────────

export const fetchFarmerProducts = createAsyncThunk(
  "farmer/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getMyProducts(1, 100);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return response.data.map((p: any) => toFarmerProduct(p));
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const fetchFarmerStats = createAsyncThunk(
  "farmer/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/farmer/dashboard/stats");
      const d = res.data.data;
      const stats: FarmerStats = {
        totalRevenue: Number(d.totalRevenue) || 0,
        totalOrders: Number(d.totalOrders) || 0,
        completedOrders: Number(d.completedOrders) || 0,
        activeOrders: Number(d.activeOrders) || 0,
        topSellingProduct: d.topSellingProduct || "-",
        // totalProducts is maintained from products array
        totalProducts: 0,
        pendingOrders: 0,
      };
      return { stats, revenueData: mockRevenueData };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const addProduct = createAsyncThunk(
  "farmer/addProduct",
  async (productData: ProductFormData, { rejectWithValue }) => {
    try {
      const createData: CreateProductData = {
        name: productData.name,
        description: productData.description,
        category: productData.category,
        retailPrice: productData.retailPrice,
        wholesalePrice: productData.wholesalePrice,
        quantity: productData.quantity,
        unit: productData.unit,
        organic: productData.organic,
        imageUrl: productData.imageUrl,
        imageFile: productData.imageFile,
        imageUrls: productData.imageUrls,
        imageFiles: productData.imageFiles,
      };

      const product = await productService.createProduct(createData);
      return toFarmerProduct(product as unknown as Record<string, unknown>);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const updateProduct = createAsyncThunk(
  "farmer/updateProduct",
  async (
    { id, data }: { id: string; data: ProductFormData },
    { rejectWithValue },
  ) => {
    try {
      const product = await productService.updateProduct({
        id,
        name: data.name,
        description: data.description,
        category: data.category,
        retailPrice: data.retailPrice,
        wholesalePrice: data.wholesalePrice,
        quantity: data.quantity,
        unit: data.unit,
        organic: data.organic,
        imageUrl: data.imageUrl,
        imageFile: data.imageFile,
        imageUrls: data.imageUrls,
        imageFiles: data.imageFiles,
      });
      return toFarmerProduct(product as unknown as Record<string, unknown>);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const deleteProduct = createAsyncThunk(
  "farmer/deleteProduct",
  async (id: string, { rejectWithValue }) => {
    try {
      await productService.deleteProduct(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

const farmerSlice = createSlice({
  name: "farmer",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchFarmerProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchFarmerProducts.fulfilled,
        (state, action: PayloadAction<FarmerProduct[]>) => {
          state.isLoading = false;
          state.products = action.payload;
          state.stats.totalProducts = action.payload.length;
        },
      )
      .addCase(fetchFarmerProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch stats
      .addCase(fetchFarmerStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFarmerStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = {
          ...action.payload.stats,
          totalProducts: state.products.length,
        };
        state.revenueData = action.payload.revenueData;
      })
      .addCase(fetchFarmerStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add product
      .addCase(addProduct.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(
        addProduct.fulfilled,
        (state, action: PayloadAction<FarmerProduct>) => {
          state.isSubmitting = false;
          state.products.unshift(action.payload);
          state.stats.totalProducts = state.products.length;
        },
      )
      .addCase(addProduct.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(
        updateProduct.fulfilled,
        (state, action: PayloadAction<FarmerProduct>) => {
          state.isSubmitting = false;
          const index = state.products.findIndex(
            (p) => p.id === action.payload.id,
          );
          if (index !== -1) {
            state.products[index] = action.payload;
          }
        },
      )
      .addCase(updateProduct.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        deleteProduct.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.products = state.products.filter(
            (p) => p.id !== action.payload,
          );
          state.stats.totalProducts = state.products.length;
        },
      )
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = farmerSlice.actions;
export default farmerSlice.reducer;
