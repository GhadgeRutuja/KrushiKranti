import { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw, Package, MapPin, Phone, User, Truck, Check } from 'lucide-react';
import { adminService } from '../adminService';
import type { DeliveryBoy } from '../types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface UnassignedOrder {
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
}

export function OrderAssignmentPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<UnassignedOrder[]>([]);
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState<number | null>(null);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState<Record<number, number>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [pagination, setPagination] = useState({ page: 0, totalPages: 0, total: 0 });

  const fetchData = useCallback(async (page: number = 0) => {
    setIsLoading(true);
    try {
      const [ordersRes, deliveryBoysRes] = await Promise.all([
        adminService.getUnassignedOrders(page, 10),
        adminService.getActiveDeliveryBoys(),
      ]);
      setOrders(ordersRes.orders);
      setDeliveryBoys(deliveryBoysRes);
      setPagination({ page, totalPages: ordersRes.totalPages, total: ordersRes.totalElements });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('adminPages.orderAssignment.failed_load_data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(0);
  }, [fetchData]);

  const handleAssign = async (orderId: number) => {
    const deliveryBoyId = selectedDeliveryBoy[orderId];
    if (!deliveryBoyId) {
      toast.error(t('adminPages.orderAssignment.select_delivery_boy'));
      return;
    }

    setIsAssigning(orderId);
    try {
      await adminService.assignDeliveryBoy(orderId, deliveryBoyId, notes[orderId]);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast.success(t('adminPages.orderAssignment.assigned_success'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('adminPages.orderAssignment.assignment_failed'));
    } finally {
      setIsAssigning(null);
    }
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="text-green-600" size={28} />
            {t('adminPages.orderAssignment.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('adminPages.orderAssignment.subtitle', { count: pagination.total })}
          </p>
        </div>
        <button
          onClick={() => fetchData(pagination.page)}
          disabled={isLoading}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {deliveryBoys.length === 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {t('adminPages.orderAssignment.no_active_delivery_boys')}
          </p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Check size={48} className="mx-auto text-green-500 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">{t('adminPages.orderAssignment.all_assigned')}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('adminPages.orderAssignment.no_pending')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Order Header */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3">
                  {order.productImage ? (
                    <img
                      src={order.productImage}
                      alt={order.productName}
                      className="w-16 h-16 rounded-lg object-cover border border-gray-100 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <Package size={24} className="text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{order.orderNumber}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {order.productName} x {order.quantity}
                    </p>
                    <p className="text-sm font-medium text-green-600 mt-1">
                      Rs. {order.totalPrice?.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium">
                  {order.status}
                </span>
              </div>

              {/* Customer & Address */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400 mb-1">{t('adminPages.orderAssignment.customer')}</p>
                  <p className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                    <User size={14} /> {order.userName}
                  </p>
                  {order.customerPhone && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1 mt-0.5">
                      <Phone size={14} /> {order.customerPhone}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400 mb-1">{t('adminPages.orderAssignment.delivery_address')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-1">
                    <MapPin size={14} className="mt-0.5 shrink-0" />
                    <span>
                      {[order.shippingAddress, order.shippingCity, order.shippingState, order.shippingPincode]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </p>
                </div>
              </div>

              {/* Assignment */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                      {t('adminPages.orderAssignment.assign_to')}
                    </label>
                    <select
                      value={selectedDeliveryBoy[order.id] || ''}
                      onChange={(e) =>
                        setSelectedDeliveryBoy((prev) => ({ ...prev, [order.id]: Number(e.target.value) }))
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">{t('adminPages.orderAssignment.select_delivery_boy_option')}</option>
                      {deliveryBoys.map((db) => (
                        <option key={db.id} value={db.id}>
                          {db.firstName} {db.lastName} - {db.phone}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                      {t('adminPages.orderAssignment.notes_optional')}
                    </label>
                    <input
                      type="text"
                      value={notes[order.id] || ''}
                      onChange={(e) => setNotes((prev) => ({ ...prev, [order.id]: e.target.value }))}
                      placeholder={t('adminPages.orderAssignment.special_instructions')}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div className="sm:self-end">
                    <button
                      onClick={() => handleAssign(order.id)}
                      disabled={isAssigning === order.id || !selectedDeliveryBoy[order.id]}
                      className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isAssigning === order.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Truck size={16} />
                      )}
                      {t('adminPages.orderAssignment.assign')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => fetchData(pagination.page - 1)}
            disabled={pagination.page === 0 || isLoading}
            className="px-3 py-1 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-50"
          >
            {t('common.previous')}
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {t('adminPages.orderAssignment.page_of', { page: pagination.page + 1, totalPages: pagination.totalPages })}
          </span>
          <button
            onClick={() => fetchData(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages - 1 || isLoading}
            className="px-3 py-1 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-50"
          >
            {t('common.next')}
          </button>
        </div>
      )}
    </div>
  );
}
