export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  retailPrice: number;
  wholesalePrice: number;
  unit: string;
  quantity: number;
  imageUrl: string;
  farmerId: string;
  farmerName: string;
  location: string;
  organic: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  // Computed/display fields for backward compat
  stock: number;
  images: string[];
  rating: number;
  reviewCount: number;
  reviews?: Review[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export type ProductCategory =
  | 'vegetables'
  | 'fruits'
  | 'grains'
  | 'pulses'
  | 'spices'
  | 'dairy'
  | 'other';

export interface ProductFilters {
  category?: ProductCategory;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  organic?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
