export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface BulkRequest {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  farmerId: string;
  farmerName: string;
  wholesalerId: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  farmerName: string;
  quantity: number;
  unit: string;
  purchasePrice: number;
  purchaseDate: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

export interface WholesalerStats {
  totalRequests: number;
  approvedOrders: number;
  pendingRequests: number;
  inventoryItems: number;
  totalInventoryValue: number;
}

export interface BulkRequestFormData {
  productId: string;
  quantity: number;
}
