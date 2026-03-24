import type { Product, ProductCategory, ProductFilters, PaginatedResponse } from './types';
import api from '../../services/api';
import { getErrorMessage } from '../../utils/errorHandler';

const normalizeImageArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }
  return [];
};

/**
 * Transform a raw backend ProductResponse into the frontend Product shape.
 * The backend returns flat fields; the frontend expects some computed fields.
 */
function transformProduct(raw: Record<string, unknown>): Product {
  const arrayImages = normalizeImageArray(raw.images ?? raw.imageUrls);
  const legacyImage = typeof raw.imageUrl === 'string'
    ? raw.imageUrl
    : (typeof raw.image === 'string' ? raw.image : '');
  const images = arrayImages.length > 0
    ? arrayImages
    : (legacyImage ? [legacyImage] : []);
  const primaryImage = images[0] ?? legacyImage ?? '';

  return {
    id: String(raw.id ?? ''),
    name: (raw.name as string) ?? '',
    description: (raw.description as string) ?? '',
    category: (raw.category as ProductCategory) ?? 'other',
    retailPrice: Number(raw.retailPrice ?? 0),
    wholesalePrice: Number(raw.wholesalePrice ?? 0),
    unit: (raw.unit as string) ?? 'kg',
    quantity: Number(raw.quantity ?? 0),
    imageUrl: primaryImage,
    farmerId: String(raw.farmerId ?? ''),
    farmerName: (raw.farmerName as string) ?? 'Unknown Farmer',
    location: (raw.location as string) ?? '',
    organic: Boolean(raw.organic),
    status: (raw.status as string) ?? 'ACTIVE',
    createdAt: (raw.createdAt as string) ?? '',
    updatedAt: (raw.updatedAt as string) ?? '',
    // Backward compatible computed fields
    stock: Number(raw.quantity ?? 0),
    images,
    rating: Number(raw.averageRating ?? raw.rating ?? 4.0),
    reviewCount: Number(raw.totalReviews ?? raw.reviewCount ?? 0),
  };
}

export interface CreateProductData {
  name: string;
  description: string;
  category: ProductCategory;
  retailPrice: number;
  wholesalePrice: number;
  unit: string;
  quantity: number;
  imageUrl?: string;
  imageFile?: File;
  imageUrls?: string[];
  imageFiles?: File[];
  location?: string;
  organic: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

export const productService = {
  /**
   * Get paginated list of products with filters (public)
   */
  async getProducts(
    filters: ProductFilters = {},
    page: number = 1,
    limit: number = 8
  ): Promise<PaginatedResponse<Product>> {
    try {
      const params = new URLSearchParams();
      params.append('page', String(page - 1)); // Spring Boot uses 0-based pagination
      params.append('size', String(limit));

      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get<{
        data: {
          content: Record<string, unknown>[];
          totalElements: number;
          totalPages: number;
          number: number;
          size: number;
        };
      }>(`/products?${params.toString()}`);

      const pageData = response.data.data;
      return {
        data: pageData.content.map(transformProduct),
        total: pageData.totalElements,
        page: pageData.number + 1,
        limit: pageData.size,
        totalPages: pageData.totalPages,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load products'));
    }
  },

  /**
   * Get a single product by ID (public)
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await api.get<{ data: Record<string, unknown> }>(`/products/${id}`);
      return transformProduct(response.data.data);
    } catch (error) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 404) {
        return null;
      }
      throw new Error(getErrorMessage(error, 'Unable to load product details'));
    }
  },

  /**
   * Create a new product (Farmer only)
   * Supports both image file upload and image URL
   */
  async createProduct(data: CreateProductData): Promise<Product> {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('category', data.category);
      formData.append('retailPrice', String(data.retailPrice));
      formData.append('wholesalePrice', String(data.wholesalePrice || 0));
      formData.append('quantity', String(data.quantity));
      formData.append('unit', data.unit);
      formData.append('organic', String(data.organic));
      if (data.location) formData.append('location', data.location);
      if (data.imageUrls?.length) data.imageUrls.forEach((url) => formData.append('imageUrls', url));
      if (data.imageFiles?.length) data.imageFiles.forEach((file) => formData.append('imageFiles', file));
      if (data.imageUrl) formData.append('imageUrl', data.imageUrl);
      if (data.imageFile) formData.append('imageFile', data.imageFile);

      const response = await api.post<{ data: Record<string, unknown> }>('/products', formData);
      return transformProduct(response.data.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to create product'));
    }
  },

  /**
   * Update an existing product (Farmer only)
   */
  async updateProduct({ id, ...data }: UpdateProductData): Promise<Product> {
    try {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.description !== undefined) formData.append('description', data.description);
      if (data.category) formData.append('category', data.category);
      if (data.retailPrice !== undefined) formData.append('retailPrice', String(data.retailPrice));
      if (data.wholesalePrice !== undefined) formData.append('wholesalePrice', String(data.wholesalePrice));
      if (data.quantity !== undefined) formData.append('quantity', String(data.quantity));
      if (data.unit) formData.append('unit', data.unit);
      if (data.organic !== undefined) formData.append('organic', String(data.organic));
      if (data.location) formData.append('location', data.location);
      if (data.imageUrls?.length) data.imageUrls.forEach((url) => formData.append('imageUrls', url));
      if (data.imageFiles?.length) data.imageFiles.forEach((file) => formData.append('imageFiles', file));
      if (data.imageUrl) formData.append('imageUrl', data.imageUrl);
      if (data.imageFile) formData.append('imageFile', data.imageFile);

      const response = await api.put<{ data: Record<string, unknown> }>(`/products/${id}`, formData);
      return transformProduct(response.data.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to update product'));
    }
  },

  /**
   * Delete a product (Farmer only)
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      await api.delete(`/products/${id}`);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to delete product'));
    }
  },

  /**
   * Get products for a specific farmer by farmer ID
   */
  async getFarmerProducts(farmerId: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Product>> {
    try {
      const response = await api.get<{
        data: {
          content: Record<string, unknown>[];
          totalElements: number;
          totalPages: number;
          number: number;
          size: number;
        };
      }>(`/products/farmer/${farmerId}?page=${page - 1}&size=${limit}`);

      const pageData = response.data.data;
      return {
        data: pageData.content.map(transformProduct),
        total: pageData.totalElements,
        page: pageData.number + 1,
        limit: pageData.size,
        totalPages: pageData.totalPages,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load farmer products'));
    }
  },

  /**
   * Get my products (for logged-in farmer) — uses JWT token automatically
   */
  async getMyProducts(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Product>> {
    try {
      const response = await api.get<{
        data: {
          content: Record<string, unknown>[];
          totalElements: number;
          totalPages: number;
          number: number;
          size: number;
        };
      }>(`/products/my-products?page=${page - 1}&size=${limit}`);

      const pageData = response.data.data;
      return {
        data: pageData.content.map(transformProduct),
        total: pageData.totalElements,
        page: pageData.number + 1,
        limit: pageData.size,
        totalPages: pageData.totalPages,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load your products'));
    }
  },

  /**
   * Get available product categories
   */
  async getCategories(): Promise<ProductCategory[]> {
    try {
      const response = await api.get<{ data: ProductCategory[] }>('/products/categories');
      return response.data.data;
    } catch {
      // Fallback to default categories if API fails
      return ['vegetables', 'fruits', 'grains', 'pulses', 'spices', 'dairy', 'other'];
    }
  },

  /**
   * Search products by query
   */
  async searchProducts(query: string, page: number = 1, limit: number = 8): Promise<PaginatedResponse<Product>> {
    return this.getProducts({ search: query }, page, limit);
  },
};
