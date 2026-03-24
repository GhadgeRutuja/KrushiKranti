import type { Order, OrderItem, OrderStatus } from "./types";
import api from "../../services/api";
import { getErrorMessage } from "../../utils/errorHandler";

/**
 * Backend expects single order with productId and quantity.
 * For multiple items, we'll create multiple orders.
 */
export interface CreateOrderData {
  productId: string;
  quantity: number;
  shippingAddress?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPincode?: string;
  customerPhone?: string;
}

/**
 * Multi-item order data from checkout page
 */
export interface CreateMultiOrderData {
  items: {
    productId: string;
    quantity: number;
  }[];
  shippingAddress?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPincode?: string;
  customerPhone?: string;
  paymentMethod: string;
}

export interface PaginatedOrderResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Backend returns flat OrderResponse (no items array).
 * This normalises it so the frontend Order shape is always correct.
 */
function normalizeOrder(raw: Record<string, any>): Order {
  // Build a single-item array from top-level product fields
  const syntheticItem: OrderItem = {
    id: String(raw.productId ?? raw.id ?? ""),
    productId: String(raw.productId ?? ""),
    name: raw.productName ?? "Product",
    price:
      raw.quantity && raw.quantity > 1
        ? Number(raw.totalPrice ?? raw.totalAmount ?? 0) / raw.quantity
        : Number(raw.totalPrice ?? raw.totalAmount ?? 0),
    quantity: raw.quantity ?? 1,
    image: raw.productImage ?? "",
    unit: "unit",
  };

  return {
    ...raw,
    id: String(raw.id),
    totalAmount: Number(raw.totalAmount ?? raw.totalPrice ?? 0),
    status: ((raw.status as string) ?? "pending").toLowerCase() as OrderStatus,
    paymentStatus: raw.paymentStatus ?? "pending",
    paymentMethod: raw.paymentMethod ?? "Online",
    shippingAddress: raw.shippingAddress ?? "",
    // Use existing items if already an array, otherwise synthesize
    items: Array.isArray(raw.items) && raw.items.length > 0
      ? raw.items.map((it: Record<string, any>) => ({ ...it, id: String(it.id) }))
      : [syntheticItem],
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  } as Order;
}

export interface UpdateOrderStatusData {
  orderId: string;
  status: OrderStatus;
}

export const orderService = {
  /**
   * Create a new order for a single product (matches backend OrderRequest)
   */
  async createOrder(data: CreateOrderData): Promise<Order> {
    try {
      const response = await api.post<{ data: Order }>("/orders", {
        productId: Number(data.productId),
        quantity: data.quantity,
        shippingAddress: data.shippingAddress,
        shippingCity: data.shippingCity,
        shippingState: data.shippingState,
        shippingPincode: data.shippingPincode,
        customerPhone: data.customerPhone,
      });
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to place order"));
    }
  },

  /**
   * Create orders for multiple items (creates one order per item)
   * Returns the first order (for payment processing)
   */
  async createMultiItemOrders(data: CreateMultiOrderData): Promise<Order> {
    try {
      const orders: Order[] = [];
      for (const item of data.items) {
        const response = await api.post<{ data: Order }>("/orders", {
          productId: Number(item.productId),
          quantity: item.quantity,
          shippingAddress: data.shippingAddress,
          shippingCity: data.shippingCity,
          shippingState: data.shippingState,
          shippingPincode: data.shippingPincode,
          customerPhone: data.customerPhone,
        });
        orders.push(response.data.data);
      }
      // Return first order (for payment processing)
      if (orders.length === 0) {
        throw new Error("No orders created");
      }
      return orders[0];
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to place orders"));
    }
  },

  /**
   * Get orders for the current user (paginated)
   */
  async getUserOrders(
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus | "all",
  ): Promise<PaginatedOrderResponse> {
    try {
      const params = new URLSearchParams();
      params.append("page", String(page - 1));
      params.append("size", String(limit));
      if (status && status !== "all") {
        params.append("status", status.toUpperCase());
      }

      const response = await api.get<{
        data: {
          content: Order[];
          totalElements: number;
          totalPages: number;
          number: number;
          size: number;
        };
      }>(`/orders/user/paginated?${params.toString()}`);

      const pageData = response.data.data;
      return {
        data: (pageData.content || []).map(normalizeOrder),
        total: pageData.totalElements || 0,
        page: (pageData.number || 0) + 1,
        limit: pageData.size || limit,
        totalPages: pageData.totalPages || 0,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to load your orders"));
    }
  },

  /**
   * Get orders for farmer (products they sell) - paginated
   */
  async getFarmerOrders(
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus | "all",
  ): Promise<PaginatedOrderResponse> {
    try {
      const params = new URLSearchParams();
      params.append("page", String(page - 1));
      params.append("size", String(limit));
      if (status && status !== "all") {
        params.append("status", status.toUpperCase());
      }

      const response = await api.get<{
        data: {
          content: Order[];
          totalElements: number;
          totalPages: number;
          number: number;
          size: number;
        };
      }>(`/orders/farmer/paginated?${params.toString()}`);

      const pageData = response.data.data;
      return {
        data: (pageData.content || []).map(normalizeOrder),
        total: pageData.totalElements || 0,
        page: (pageData.number || 0) + 1,
        limit: pageData.size || limit,
        totalPages: pageData.totalPages || 0,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to load farmer orders"));
    }
  },

  /**
   * Get a single order by ID
   */
  async getOrderById(orderId: string): Promise<Order> {
    try {
      const response = await api.get<{ data: Record<string, any> }>(`/orders/${orderId}`);
      return normalizeOrder(response.data.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to load order details"));
    }
  },

  /**
   * Update order status (Farmer/Admin)
   */
  async updateOrderStatus(data: UpdateOrderStatusData): Promise<Order> {
    try {
      const response = await api.put<{ data: Order }>(
        `/orders/${data.orderId}/status`,
        { status: data.status },
      );
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to update order status"));
    }
  },

  /**
   * Cancel an order (User - only if pending)
   */
  async cancelOrder(orderId: string): Promise<Order> {
    try {
      const response = await api.post<{ data: Order }>(
        `/orders/${orderId}/cancel`,
      );
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to cancel order"));
    }
  },

  /**
   * Get all orders (Admin only)
   */
  async getAllOrders(
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus | "all",
  ): Promise<PaginatedOrderResponse> {
    try {
      const params = new URLSearchParams();
      params.append("page", String(page - 1));
      params.append("size", String(limit));
      if (status && status !== "all") {
        params.append("status", status);
      }

      const response = await api.get<{
        data: {
          content: Order[];
          totalElements: number;
          totalPages: number;
          number: number;
          size: number;
        };
      }>(`/orders/admin/all?${params.toString()}`);

      const pageData = response.data.data;
      return {
        data: pageData.content,
        total: pageData.totalElements,
        page: pageData.number + 1,
        limit: pageData.size,
        totalPages: pageData.totalPages,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to load all orders"));
    }
  },

  /**
   * Download order invoice
   */
  async downloadInvoice(orderId: string): Promise<Blob> {
    try {
      const response = await api.get(`/invoices/${orderId}`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to download invoice"));
    }
  },

  /**
   * Track order delivery
   */
  async trackOrder(orderId: string): Promise<{
    status: OrderStatus;
    trackingNumber?: string;
    estimatedDelivery?: string;
    updates: Array<{
      status: string;
      timestamp: string;
      location?: string;
      description: string;
    }>;
  }> {
    try {
      const response = await api.get<{
        data: {
          status: OrderStatus;
          trackingNumber?: string;
          estimatedDelivery?: string;
          updates: Array<{
            status: string;
            timestamp: string;
            location?: string;
            description: string;
          }>;
        };
      }>(`/orders/${orderId}/track`);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to track order"));
    }
  },

  /**
   * Get farmer order statistics
   */
  async getFarmerStats(): Promise<{
    totalOrders: number;
    totalEarnings: number;
    pendingOrders: number;
    completedOrders: number;
  }> {
    try {
      const response = await api.get<{
        data: {
          totalOrders: number;
          totalEarnings: number;
          pendingOrders: number;
          completedOrders: number;
        };
      }>("/orders/farmer/stats");
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to load farmer stats"));
    }
  },

  /**
   * Get admin order statistics
   */
  async getAdminStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    totalCommission: number;
    pendingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
  }> {
    try {
      const response = await api.get<{
        data: {
          totalOrders: number;
          totalRevenue: number;
          totalCommission: number;
          pendingOrders: number;
          shippedOrders: number;
          deliveredOrders: number;
        };
      }>("/orders/admin/stats");
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to load admin stats"));
    }
  },
};
