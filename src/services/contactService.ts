import api from './api';
import { getErrorMessage } from '../utils/errorHandler';

export interface ContactFormRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessageItem {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'READ' | 'UNREAD';
  createdAt: string;
}

export const contactService = {
  async submitContactMessage(payload: ContactFormRequest): Promise<ContactMessageItem> {
    try {
      const response = await api.post<{ data: ContactMessageItem }>('/contact', payload);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to send your message'));
    }
  },

  async getAdminContactMessages(): Promise<ContactMessageItem[]> {
    try {
      const response = await api.get<{ data: ContactMessageItem[] }>('/admin/contact-messages');
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load contact messages'));
    }
  },

  async getAdminUnreadContactCount(): Promise<number> {
    try {
      const response = await api.get<{ data: { count: number } }>('/admin/contact-messages/unread-count');
      return response.data.data.count;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load unread contact count'));
    }
  },

  async markAdminContactMessageRead(id: number): Promise<ContactMessageItem> {
    try {
      const response = await api.put<{ data: ContactMessageItem }>(`/admin/contact-messages/${id}/read`);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to mark message as read'));
    }
  },

  async deleteAdminContactMessage(id: number): Promise<void> {
    try {
      await api.delete(`/admin/contact-messages/${id}`);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to delete message'));
    }
  },
};
