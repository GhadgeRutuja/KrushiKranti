import api from '../../services/api';
import type { AdminUser, DeliveryBoy, CreateDeliveryBoyRequest, UpdateDeliveryBoyRequest, DeliveryBoyStats } from './types';
import { getErrorMessage } from '../../utils/errorHandler';

export interface PaginatedUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export const adminService = {
  /**
   * Get paginated list of all users (Admin only)
   */
  async getAllUsers(page: number = 0, size: number = 20): Promise<PaginatedUsersResponse> {
    try {
      const response = await api.get<{
        data: {
          content: Array<{
            id: number;
            name: string;
            email: string;
            firstName: string;
            lastName: string;
            phone?: string;
            profileImageUrl?: string;
            role: string;
            status: string;
            createdAt: string;
            lastLogin?: string;
          }>;
          totalElements: number;
          totalPages: number;
          number: number;
          size: number;
        };
      }>(`/users?page=${page}&size=${size}`);

      const pageData = response.data.data;
      return {
        users: pageData.content.map((u) => ({
          id: String(u.id),
          name: u.name || `${u.firstName} ${u.lastName}`,
          email: u.email,
          role: u.role as AdminUser['role'],
          status: u.status as AdminUser['status'],
          createdAt: u.createdAt,
          lastLogin: u.lastLogin,
        })),
        total: pageData.totalElements,
        page: pageData.number,
        size: pageData.size,
        totalPages: pageData.totalPages,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch users'));
    }
  },

  /**
   * Ban a user (Admin only)
   */
  async banUser(userId: string): Promise<AdminUser> {
    try {
      const response = await api.put<{
        data: {
          id: number;
          name: string;
          email: string;
          role: string;
          status: string;
          createdAt: string;
          lastLogin?: string;
        };
      }>(`/users/${userId}/ban`);

      const u = response.data.data;
      return {
        id: String(u.id),
        name: u.name,
        email: u.email,
        role: u.role as AdminUser['role'],
        status: u.status as AdminUser['status'],
        createdAt: u.createdAt,
        lastLogin: u.lastLogin,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to ban user'));
    }
  },

  /**
   * Unban a user (Admin only)
   */
  async unbanUser(userId: string): Promise<AdminUser> {
    try {
      const response = await api.put<{
        data: {
          id: number;
          name: string;
          email: string;
          role: string;
          status: string;
          createdAt: string;
          lastLogin?: string;
        };
      }>(`/users/${userId}/unban`);

      const u = response.data.data;
      return {
        id: String(u.id),
        name: u.name,
        email: u.email,
        role: u.role as AdminUser['role'],
        status: u.status as AdminUser['status'],
        createdAt: u.createdAt,
        lastLogin: u.lastLogin,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to unban user'));
    }
  },

  /**
   * Delete a user (Admin only)
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await api.delete(`/users/${userId}`);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to delete user'));
    }
  },

  async getAdminLogs(
    page: number = 0,
    size: number = 20,
    search?: string,
    type?: string,
  ): Promise<{
    logs: Array<{
      id: number;
      adminId: number;
      adminName: string;
      action: string;
      target: string;
      type: string;
      createdAt: string;
    }>;
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }> {
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('size', String(size));
      if (search) params.set('search', search);
      if (type) params.set('type', type);

      const response = await api.get(`/admin/logs?${params.toString()}`);
      const pageData = response.data.data;
      return {
        logs: pageData.content,
        totalElements: pageData.totalElements,
        totalPages: pageData.totalPages,
        number: pageData.number,
        size: pageData.size,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch admin logs'));
    }
  },

  // ==================== Delivery Boy Management ====================

  /**
   * Get all delivery boys with pagination (Admin only)
   */
  async getAllDeliveryBoys(page: number = 0, size: number = 10, enabled?: boolean): Promise<{
    deliveryBoys: DeliveryBoy[];
    totalElements: number;
    totalPages: number;
  }> {
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('size', String(size));
      if (enabled !== undefined) params.set('enabled', String(enabled));

      const response = await api.get(`/admin/delivery-boys?${params.toString()}`);
      const pageData = response.data.data;
      return {
        deliveryBoys: pageData.content,
        totalElements: pageData.totalElements,
        totalPages: pageData.totalPages,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch delivery boys'));
    }
  },

  /**
   * Get all active delivery boys (for dropdown selection)
   */
  async getActiveDeliveryBoys(): Promise<DeliveryBoy[]> {
    try {
      const response = await api.get('/admin/delivery-boys/active');
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch active delivery boys'));
    }
  },

  /**
   * Get delivery boy by ID
   */
  async getDeliveryBoyById(id: number): Promise<DeliveryBoy> {
    try {
      const response = await api.get(`/admin/delivery-boys/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch delivery boy'));
    }
  },

  /**
   * Create a new delivery boy (Admin only)
   */
  async createDeliveryBoy(data: CreateDeliveryBoyRequest): Promise<DeliveryBoy> {
    try {
      const response = await api.post('/admin/delivery-boys', data);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to create delivery boy'));
    }
  },

  /**
   * Update delivery boy details (Admin only)
   */
  async updateDeliveryBoy(id: number, data: UpdateDeliveryBoyRequest): Promise<DeliveryBoy> {
    try {
      const response = await api.put(`/admin/delivery-boys/${id}`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to update delivery boy'));
    }
  },

  /**
   * Activate or deactivate a delivery boy (Admin only)
   */
  async setDeliveryBoyStatus(id: number, enabled: boolean): Promise<DeliveryBoy> {
    try {
      const response = await api.put(`/admin/delivery-boys/${id}/status?enabled=${enabled}`);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to update delivery boy status'));
    }
  },

  /**
   * Delete a delivery boy (Admin only)
   */
  async deleteDeliveryBoy(id: number): Promise<void> {
    try {
      await api.delete(`/admin/delivery-boys/${id}`);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to delete delivery boy'));
    }
  },

  /**
   * Get delivery boy stats (Admin only)
   */
  async getDeliveryBoyStats(id: number): Promise<DeliveryBoyStats> {
    try {
      const response = await api.get(`/admin/delivery-boys/${id}/stats`);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch delivery boy stats'));
    }
  },

  // ==================== Order Assignment ====================

  /**
   * Get unassigned orders (Admin only)
   */
  async getUnassignedOrders(page: number = 0, size: number = 10): Promise<{
    orders: Array<{
      id: number;
      orderNumber: string;
      productName: string;
      productImage: string;
      quantity: number;
      totalPrice: number;
      status: string;
      shippingAddress: string;
      shippingCity: string;
      shippingState: string;
      shippingPincode: string;
      customerPhone: string;
      userName: string;
      createdAt: string;
    }>;
    totalElements: number;
    totalPages: number;
  }> {
    try {
      const response = await api.get(`/admin/orders/unassigned?page=${page}&size=${size}`);
      const pageData = response.data.data;
      return {
        orders: pageData.content,
        totalElements: pageData.totalElements,
        totalPages: pageData.totalPages,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch unassigned orders'));
    }
  },

  /**
   * Assign delivery boy to an order (Admin only)
   */
  async assignDeliveryBoy(orderId: number, deliveryBoyId: number, notes?: string): Promise<void> {
    try {
      const params = new URLSearchParams();
      params.set('deliveryBoyId', String(deliveryBoyId));
      if (notes) params.set('notes', notes);
      await api.post(`/admin/orders/${orderId}/assign?${params.toString()}`);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to assign delivery boy'));
    }
  },
};
