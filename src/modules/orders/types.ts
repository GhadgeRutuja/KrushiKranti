export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export type DeliveryStatus = 'PENDING' | 'PICKUP_SCHEDULED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  unit: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPincode?: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  invoiceUrl?: string;
  
  // Shiprocket tracking fields
  shipmentId?: string;
  awbCode?: string;
  courierName?: string;
  trackingStatus?: string;
  deliveryStatus?: DeliveryStatus;
  estimatedDelivery?: string;
  
  // Commission fields
  adminCommission?: number;
  farmerAmount?: number;
  
  // Farmer info
  farmerId?: string;
  farmerName?: string;
  farmLocation?: string;
  farmerPhone?: string;
  
  // Product info for single product orders
  productId?: string;
  productName?: string;
  productImage?: string;
  quantity?: number;
  totalPrice?: number;
}

export interface FarmerOrder extends Order {
  customerName: string;
  farmerEarnings: number;
}

export interface AdminOrder extends Order {
  platformCommission: number;
  farmerPayout: number;
}

