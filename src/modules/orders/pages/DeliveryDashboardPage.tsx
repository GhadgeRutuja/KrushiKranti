import { useState, useEffect, useCallback } from 'react';
import {
    RiTruckLine,
    RiCheckDoubleLine,
    RiMapPinLine,
    RiPhoneLine,
    RiRefreshLine,
    RiArrowLeftLine,
    RiFilterLine,
    RiShoppingBagLine,
    RiTimeLine,
} from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { stompService } from '../../../services/stompService';
import {
    trackingService,
    type DeliveryOrder,
    type DeliveryStatus,
} from '../trackingService';

const STATUS_OPTIONS: { value: DeliveryStatus | ''; label: string }[] = [
    { value: '', label: 'All Deliveries' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled' },
    { value: 'PICKED_UP', label: 'Picked Up' },
    { value: 'IN_TRANSIT', label: 'In Transit' },
    { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'RETURNED', label: 'Returned' },
];

const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    PICKUP_SCHEDULED: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    PICKED_UP: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
    IN_TRANSIT: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    OUT_FOR_DELIVERY: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    DELIVERED: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    CANCELLED: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    RETURNED: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
};

const NEXT_STATUS: Record<string, DeliveryStatus> = {
    PENDING: 'PICKUP_SCHEDULED',
    PICKUP_SCHEDULED: 'PICKED_UP',
    PICKED_UP: 'IN_TRANSIT',
    IN_TRANSIT: 'OUT_FOR_DELIVERY',
    OUT_FOR_DELIVERY: 'DELIVERED',
};

export function DeliveryDashboardPage() {
    const [orders, setOrders] = useState<DeliveryOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<DeliveryStatus | ''>('');
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await trackingService.getDeliveryPartnerOrders(
                0,
                50,
                filter || undefined
            );
            setOrders(result.content || []);
        } catch (err) {
            setError((err as Error).message);
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchOrders();

        // Subscribe to all order updates via WebSocket
        const handleOrderUpdate = (updatedOrder: any) => {
            setOrders((prevOrders) => {
                const index = prevOrders.findIndex((o) => o.id === updatedOrder.id);
                if (index >= 0) {
                    // Update existing order in the list
                    const newOrders = [...prevOrders];
                    newOrders[index] = { ...newOrders[index], ...updatedOrder };
                    return newOrders;
                }
                // Add new order if not found
                return [...prevOrders, updatedOrder];
            });
        };

        if (stompService.isConnected) {
            stompService.subscribeToAllOrders(handleOrderUpdate);
        }

        return () => {
            stompService.unsubscribeFromAllOrders();
        };
    }, [fetchOrders]);

    const handleStatusUpdate = async (orderId: number, newStatus: DeliveryStatus) => {
        setUpdatingId(orderId);
        try {
            await trackingService.updateDeliveryStatus(orderId, newStatus);
            await fetchOrders();
        } catch (err) {
            alert((err as Error).message);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleMarkDelivered = async (orderId: number) => {
        if (!confirm('Mark this order as delivered?')) return;
        handleStatusUpdate(orderId, 'DELIVERED');
    };

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <Link
                        to="/orders"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 mb-2"
                    >
                        <RiArrowLeftLine size={16} />
                        Back to Orders
                    </Link>
                    <h1 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <RiTruckLine size={22} className="text-green-600" />
                        Delivery Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Manage your assigned deliveries
                    </p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                    <RiRefreshLine size={15} />
                    Refresh
                </button>
            </div>

            {/* Filter bar */}
            <div className="flex items-center gap-2 flex-wrap">
                <RiFilterLine size={16} className="text-slate-400" />
                {STATUS_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => setFilter(opt.value as DeliveryStatus | '')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${filter === opt.value
                                ? 'bg-green-600 text-white border-green-600'
                                : 'bg-white dark:bg-gray-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-green-400'
                            }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-700 dark:text-red-400">
                    {error}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20">
                    <RiTruckLine size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No deliveries found</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                        {filter ? 'Try changing the filter' : 'No orders have been assigned to you yet'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const nextStatus = NEXT_STATUS[order.deliveryStatus];
                        const isUpdating = updatingId === order.id;
                        const isDelivered = order.deliveryStatus === 'DELIVERED';

                        return (
                            <div
                                key={order.id}
                                className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden"
                            >
                                {/* Top row: order info + status */}
                                <div className="px-5 py-4 flex items-start justify-between gap-4 flex-wrap">
                                    <div className="flex items-start gap-4">
                                        {order.productImage ? (
                                            <img
                                                src={order.productImage}
                                                alt={order.productName}
                                                className="w-14 h-14 rounded-lg object-cover border border-slate-100 dark:border-slate-700"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <RiShoppingBagLine size={20} className="text-slate-400" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                {order.orderNumber}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                {order.productName} × {order.quantity}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                                <RiTimeLine size={11} />
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold ${STATUS_COLORS[order.deliveryStatus] || STATUS_COLORS.PENDING
                                            }`}
                                    >
                                        {order.deliveryStatus?.replace(/_/g, ' ') || 'PENDING'}
                                    </span>
                                </div>

                                {/* Shipping address */}
                                <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                                            Delivery Address
                                        </p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-1.5">
                                            <RiMapPinLine size={13} className="text-slate-400 mt-0.5 shrink-0" />
                                            <span>
                                                {[order.shippingAddress, order.shippingCity, order.shippingState, order.shippingPincode]
                                                    .filter(Boolean)
                                                    .join(', ')}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                                            Customer
                                        </p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">{order.userName}</p>
                                        {order.customerPhone && (
                                            <a
                                                href={`tel:${order.customerPhone}`}
                                                className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium mt-0.5"
                                            >
                                                <RiPhoneLine size={11} />
                                                {order.customerPhone}
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Notes */}
                                {order.deliveryNotes && (
                                    <div className="px-5 py-2 border-t border-slate-100 dark:border-slate-800">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            <strong className="text-slate-600 dark:text-slate-300">Note:</strong>{' '}
                                            {order.deliveryNotes}
                                        </p>
                                    </div>
                                )}

                                {/* Action buttons */}
                                {!isDelivered && (
                                    <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">
                                        {nextStatus && (
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, nextStatus)}
                                                disabled={isUpdating}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                                            >
                                                <RiTruckLine size={14} />
                                                {isUpdating
                                                    ? 'Updating…'
                                                    : `Mark as ${nextStatus.replace(/_/g, ' ')}`}
                                            </button>
                                        )}
                                        {order.deliveryStatus === 'OUT_FOR_DELIVERY' && (
                                            <button
                                                onClick={() => handleMarkDelivered(order.id)}
                                                disabled={isUpdating}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                            >
                                                <RiCheckDoubleLine size={14} />
                                                {isUpdating ? 'Updating…' : 'Mark Delivered'}
                                            </button>
                                        )}
                                        <Link
                                            to={`/orders/${order.id}/track`}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <RiMapPinLine size={14} />
                                            View Tracking
                                        </Link>
                                    </div>
                                )}

                                {/* Delivered badge */}
                                {isDelivered && (
                                    <div className="px-5 py-3 border-t border-green-100 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10">
                                        <p className="text-xs font-semibold text-green-700 dark:text-green-400 flex items-center gap-1.5">
                                            <RiCheckDoubleLine size={14} />
                                            Order delivered successfully
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
