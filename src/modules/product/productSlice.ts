import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Product, ProductCategory, ProductFilters } from './types';
import { productService, type CreateProductData, type UpdateProductData } from './productService';
import { getThunkErrorMessage } from '../../utils/errorHandler';

interface ProductState {
  products: Product[];
  farmerProducts: Product[];
  selectedProduct: Product | null;
  categories: ProductCategory[];
  filters: ProductFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  isLoadingProduct: boolean;
  isSaving: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  farmerProducts: [],
  selectedProduct: null,
  categories: [],
  filters: {},
  pagination: {
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  isLoadingProduct: false,
  isSaving: false,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (
    { filters, page, limit }: { filters?: ProductFilters; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await productService.getProducts(filters, page, limit);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'product/fetchProductById',
  async (id: string, { rejectWithValue }) => {
    try {
      const product = await productService.getProductById(id);
      if (!product) {
        throw new Error('Product not found');
      }
      return product;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'product/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await productService.getCategories();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchMyProducts = createAsyncThunk(
  'product/fetchMyProducts',
  async ({ page, limit }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getMyProducts(page, limit);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createProduct = createAsyncThunk(
  'product/createProduct',
  async (data: CreateProductData, { rejectWithValue }) => {
    try {
      const product = await productService.createProduct(data);
      return product;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'product/updateProduct',
  async (data: UpdateProductData, { rejectWithValue }) => {
    try {
      const product = await productService.updateProduct(data);
      return product;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'product/deleteProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      await productService.deleteProduct(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ProductFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = getThunkErrorMessage(action, 'Unable to load products');
      })
      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.isLoadingProduct = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoadingProduct = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoadingProduct = false;
        state.error = getThunkErrorMessage(action, 'Unable to load product details');
      })
      // Fetch categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Fetch my products (farmer)
      .addCase(fetchMyProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.farmerProducts = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchMyProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = getThunkErrorMessage(action, 'Unable to load your products');
      })
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isSaving = false;
        state.farmerProducts.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isSaving = false;
        state.error = getThunkErrorMessage(action, 'Unable to create product');
      })
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isSaving = false;
        const index = state.farmerProducts.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.farmerProducts[index] = action.payload;
        }
        if (state.selectedProduct?.id === action.payload.id) {
          state.selectedProduct = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isSaving = false;
        state.error = getThunkErrorMessage(action, 'Unable to update product');
      })
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isSaving = false;
        state.farmerProducts = state.farmerProducts.filter(p => p.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isSaving = false;
        state.error = getThunkErrorMessage(action, 'Unable to delete product');
      });
  },
});

export const { setFilters, clearFilters, setPage, clearSelectedProduct, clearError } = productSlice.actions;
export default productSlice.reducer;
