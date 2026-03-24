import type { ProductCategory } from '../product/types';

export interface FarmerProduct {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  retailPrice: number;
  wholesalePrice: number;
  quantity: number;
  unit: string;
  images: string[];
  organic: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface FarmerStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  activeOrders: number;
  topSellingProduct: string;
}

export interface RevenueData {
  month: string;
  revenue: number;
}

export interface ProductFormData {
  name: string;
  category: ProductCategory;
  description: string;
  retailPrice: number;
  wholesalePrice: number;
  quantity: number;
  unit: string;
  organic: boolean;
  imagePreview?: string;
  imagePreviews?: string[];
  imageUrl?: string;
  imageUrls?: string[];
  imageFile?: File;
  imageFiles?: File[];
}
