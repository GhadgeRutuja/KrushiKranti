import api from '../../services/api';
import { getErrorMessage } from '../../utils/errorHandler';

export interface TrackingActivity {
  date: string;
  activity: string;
  location: string;
}

export interface TrackingInfo {
  orderId: number;
  orderNumber: string;
  orderStatus: string;
  deliveryStatus: string;
  awbCode: string;
  courierName: string;
  currentStatus: string;
  currentLocation: string;
  estimatedDelivery: string;
  trackingUrl: string;
  trackingActivities: TrackingActivity[];
  success: boolean;
  message?: string;
  deliveryPartnerName?: string;
  deliveryPartnerPhone?: string;
}

export interface ShipmentInfo {
  shipmentId: string;
  awbCode: string;
  courierName: string;
  trackingStatus: string;
  deliveryStatus: string;
  estimatedDelivery: string;
}

export type DeliveryStatus =
  | 'PENDING'
  | 'PICKUP_SCHEDULED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export interface DeliveryOrder {
  id: number;
  orderNumber: string;
  productName: string;
  productImage: string;
  quantity: number;
  totalPrice: number;
  totalAmount: number;
  status: string;
  deliveryStatus: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  customerPhone: string;
  userName: string;
  userEmail: string;
  createdAt: string;
  deliveryPartnerName: string;
  deliveryPartnerPhone: string;
  deliveryNotes: string;
  courierName: string;
  awbCode: string;
}

export const trackingService = {
  async getOrderTracking(orderId: string | number): Promise<TrackingInfo> {
    try {
      // If it looks like an order number (starts with letters), use the orderNumber endpoint
      const idStr = String(orderId);
      const isOrderNumber = isNaN(Number(orderId)) || idStr.startsWith('KK-') || idStr.startsWith('ORD-');
      const endpoint = isOrderNumber 
        ? `/orders/track/${orderId}` 
        : `/orders/${orderId}/track`;
      const response = await api.get<{ data: TrackingInfo }>(endpoint);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load tracking information'));
    }
  },

  async getOrderById(orderId: string | number) {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load order details'));
    }
  },

  async createShipment(orderId: string | number): Promise<ShipmentInfo> {
    try {
      const response = await api.post<{ data: ShipmentInfo }>(`/orders/${orderId}/create-shipment`);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to create shipment'));
    }
  },

  async assignDeliveryPartner(orderId: number, deliveryPartnerId: number, notes?: string) {
    try {
      const response = await api.post(`/orders/${orderId}/assign-delivery`, {
        deliveryPartnerId,
        notes,
      });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to assign delivery partner'));
    }
  },

  async updateDeliveryStatus(orderId: number, deliveryStatus: DeliveryStatus) {
    try {
      const response = await api.put(`/delivery/orders/${orderId}/status?status=${deliveryStatus}`);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to update delivery status'));
    }
  },

  async getDeliveryPartnerOrders(
    page = 0,
    size = 10,
    deliveryStatus?: DeliveryStatus
  ): Promise<{ content: DeliveryOrder[]; totalElements: number; totalPages: number }> {
    try {
      const params: Record<string, string | number> = { page, size };
      if (deliveryStatus) params.status = deliveryStatus;
      const response = await api.get('/delivery/orders', { params });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load delivery orders'));
    }
  },

  async getDeliveryDashboardStats(): Promise<{
    totalAssignedOrders: number;
    pendingDeliveries: number;
    inTransitDeliveries: number;
    completedDeliveries: number;
  }> {
    try {
      const response = await api.get('/delivery/dashboard/stats');
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load dashboard stats'));
    }
  },
};
