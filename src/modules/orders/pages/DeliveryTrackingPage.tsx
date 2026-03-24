import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    RiArrowLeftLine,
    RiShoppingBagLine,
    RiCheckboxCircleLine,
    RiTruckLine,
    RiMapPinLine,
    RiCheckDoubleLine,
    RiPhoneLine,
    RiUserLine,
    RiCalendarLine,
    RiInformationLine,
    RiLoader4Line,
} from 'react-icons/ri';
import { trackingService, type TrackingInfo } from '../trackingService';

// ── Types ────────────────────────────────────────────────────────────────────
type TrackingStep = {
    key: string;
    label: string;
    description: string;
    responsible: string;
    icon: React.ElementType;
    done: boolean;
};

const buildSteps = (orderStatus: string, deliveryStatus: string): TrackingStep[] => {
    const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const deliveryOrder = ['PENDING', 'PICKUP_SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];

    const currentOrderIdx = statusOrder.indexOf(orderStatus?.toUpperCase() || 'PENDING');
    const currentDeliveryIdx = deliveryOrder.indexOf(deliveryStatus?.toUpperCase() || 'PENDING');

    return [
        {
            key: 'placed',
            label: 'Order Placed',
            description: 'Your order has been placed successfully.',
            responsible: 'You (Customer)',
            icon: RiShoppingBagLine,
            done: currentOrderIdx >= 0,
        },
        {
            key: 'confirmed',
            label: 'Order Confirmed',
            description: 'Farmer has confirmed and accepted your order.',
            responsible: 'Farmer',
            icon: RiCheckboxCircleLine,
            done: currentOrderIdx >= 1,
        },
        {
            key: 'shipped',
            label: 'Shipped',
            description: 'Order has been picked up and is in transit.',
            responsible: 'Farmer / Delivery Partner',
            icon: RiTruckLine,
            done: currentOrderIdx >= 3 || currentDeliveryIdx >= 2,
        },
        {
            key: 'out_for_delivery',
            label: 'Out for Delivery',
            description: 'Delivery partner is on the way to your location.',
            responsible: 'Delivery Partner',
            icon: RiMapPinLine,
            done: currentDeliveryIdx >= 4,
        },
        {
            key: 'delivered',
            label: 'Delivered',
            description: 'Order has been delivered to your address.',
            responsible: 'Delivery Partner',
            icon: RiCheckDoubleLine,
            done: currentOrderIdx >= 4 || currentDeliveryIdx >= 5,
        },
    ];
};

export function DeliveryTrackingPage() {
    const { id } = useParams<{ id: string }>();
    const [tracking, setTracking] = useState<TrackingInfo | null>(null);
    const [orderDetails, setOrderDetails] = useState<Record<string, unknown> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        const load = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [trackingData, orderData] = await Promise.all([
                    trackingService.getOrderTracking(id),
                    trackingService.getOrderById(id),
                ]);
                setTracking(trackingData);
                setOrderDetails(orderData as unknown as Record<string, unknown>);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <RiLoader4Line size={32} className="text-green-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl space-y-4">
                <Link
                    to="/orders"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400"
                >
                    <RiArrowLeftLine size={16} />
                    Back to Orders
                </Link>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-700 dark:text-red-400">
                    {error}
                </div>
            </div>
        );
    }

    const orderStatus = tracking?.orderStatus || 'PENDING';
    const deliveryStatus = tracking?.deliveryStatus || 'PENDING';
    const steps = buildSteps(orderStatus, deliveryStatus);
    const currentStepIdx = [...steps].reverse().findIndex((s) => s.done);
    const currentStep = currentStepIdx >= 0 ? steps.length - 1 - currentStepIdx : 0;

    const productName = (orderDetails?.productName as string) || 'Product';
    const quantity = (orderDetails?.quantity as number) || 0;
    const totalPrice = (orderDetails?.totalAmount as number) || (orderDetails?.totalPrice as number) || 0;
    const createdAt = (orderDetails?.createdAt as string) || '';
    const shippingAddress = [
        orderDetails?.shippingAddress,
        orderDetails?.shippingCity,
        orderDetails?.shippingState,
        orderDetails?.shippingPincode,
    ]
        .filter(Boolean)
        .join(', ');

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Back link */}
            <Link
                to="/orders"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400"
            >
                <RiArrowLeftLine size={16} />
                Back to Orders
            </Link>

            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Delivery Tracking</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Order #{tracking?.orderNumber || id} · {productName}
                </p>
            </div>

            {/* Order summary card */}
            <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800">
                <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Product', value: productName },
                        { label: 'Qty', value: String(quantity) },
                        { label: 'Total', value: `₹${totalPrice}` },
                        {
                            label: 'Order Date',
                            value: createdAt
                                ? new Date(createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })
                                : '—',
                        },
                    ].map((row) => (
                        <div key={row.label}>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{row.label}</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{row.value}</p>
                        </div>
                    ))}
                </div>

                {/* Estimated delivery + current status */}
                <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <RiCalendarLine size={15} className="text-slate-400 shrink-0" />
                        <span>
                            Estimated delivery:{' '}
                            <strong className="text-slate-900 dark:text-white">
                                {tracking?.estimatedDelivery || '—'}
                            </strong>
                        </span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded border text-xs font-semibold text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
                        <RiMapPinLine size={12} />
                        {deliveryStatus?.replace(/_/g, ' ') || 'PENDING'}
                    </span>
                </div>
            </div>

            {/* Delivery Timeline */}
            <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-6">Delivery Timeline</h3>

                <div className="relative">
                    {/* Vertical connector line */}
                    <div className="absolute left-[19px] top-5 bottom-5 w-px bg-slate-200 dark:bg-slate-700" />

                    <div className="space-y-5">
                        {steps.map((step, idx) => {
                            const Icon = step.icon;
                            const isActive = idx === currentStep;
                            const isFuture = idx > currentStep;

                            return (
                                <div key={step.key} className="flex items-start gap-4 relative">
                                    {/* Step icon */}
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 z-10 ${step.done && !isActive
                                                ? 'bg-green-600 border-green-600 text-white'
                                                : isActive
                                                    ? 'bg-white dark:bg-gray-900 border-yellow-500 text-yellow-500'
                                                    : 'bg-white dark:bg-gray-900 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600'
                                            }`}
                                    >
                                        <Icon size={16} />
                                    </div>

                                    {/* Step content */}
                                    <div className="flex-1 pt-1 pb-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p
                                                className={`text-sm font-semibold ${isFuture
                                                        ? 'text-slate-400 dark:text-slate-600'
                                                        : 'text-slate-900 dark:text-white'
                                                    }`}
                                            >
                                                {step.label}
                                            </p>
                                            {isActive && (
                                                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                                                    Current
                                                </span>
                                            )}
                                        </div>

                                        <p
                                            className={`text-xs mt-0.5 ${isFuture ? 'text-slate-400 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'
                                                }`}
                                        >
                                            {step.description}
                                        </p>

                                        <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                <RiUserLine size={10} />
                                                {step.responsible}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Delivery Partner + Address */}
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-1.5">
                        <RiUserLine size={12} /> Delivery Partner
                    </h3>
                    {tracking?.deliveryPartnerName ? (
                        <>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                {tracking.deliveryPartnerName}
                            </p>
                            {tracking.deliveryPartnerPhone && (
                                <a
                                    href={`tel:${tracking.deliveryPartnerPhone}`}
                                    className="flex items-center gap-1.5 text-sm font-medium text-green-700 dark:text-green-400 mt-3"
                                >
                                    <RiPhoneLine size={14} />
                                    {tracking.deliveryPartnerPhone}
                                </a>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-slate-400 dark:text-slate-500">Not yet assigned</p>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-1.5">
                        <RiMapPinLine size={12} /> Delivery Address
                    </h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {shippingAddress || 'Address not available'}
                    </p>
                </div>
            </div>

            {/* Courier info */}
            {tracking?.courierName && (
                <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                        Courier Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-slate-400">Courier</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{tracking.courierName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">AWB Code</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                {tracking.awbCode || '—'}
                            </p>
                        </div>
                    </div>
                    {tracking.trackingUrl && (
                        <a
                            href={tracking.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium mt-3"
                        >
                            Track on courier website →
                        </a>
                    )}
                </div>
            )}

            {/* Responsibility note */}
            <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3">
                <RiInformationLine size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    <strong className="text-slate-700 dark:text-slate-300">Status Responsibilities:</strong> Order
                    confirmation is updated by the Farmer. Shipping status is updated by the Farmer or Wholesaler.
                    Out-for-delivery and final delivery are updated by the Delivery Partner.
                </p>
            </div>
        </div>
    );
}
