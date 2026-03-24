import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  RiArrowLeftLine,
  RiShoppingBagLine,
  RiCheckboxCircleLine,
  RiTruckLine,
  RiMapPinLine,
  RiCheckDoubleLine,
  RiPhoneLine,
  RiTimeLine,
  RiLoader4Line,
  RiExternalLinkLine,
  RiFileListLine,
  RiWallet3Line,
} from "react-icons/ri";
import { useAppDispatch, useAppSelector } from "../../../shared/hooks";
import { fetchOrderTracking, clearTrackingInfo } from "../trackingSlice";
import { trackingService } from "../trackingService";

// Type for the order returned by trackingService
type TrackingOrder = Awaited<ReturnType<typeof trackingService.getOrderById>>;

// ── Types ────────────────────────────────────────────────────────────────────
type TrackingStep = {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  done: boolean;
  timestamp?: string;
};

// ── Status mapping ───────────────────────────────────────────────────────────
const STATUS_ORDER = [
  "PLACED",
  "CONFIRMED",
  "PAID",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

function mapStatusToStep(status: string): number {
  const upperStatus = status?.toUpperCase() || "PLACED";
  const index = STATUS_ORDER.indexOf(upperStatus);
  return index >= 0 ? index : 0;
}

export function OrderTrackingPage() {
  const { id: orderId } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { trackingInfo, isLoading: trackingLoading } = useAppSelector(
    (state) => state.tracking,
  );

  // Local state for order
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [orderLoading, setOrderLoading] = useState(true);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Fetch order details
  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      setOrderLoading(true);
      setOrderError(null);
      try {
        const data = await trackingService.getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        setOrderError((err as Error).message || "Failed to load order");
      } finally {
        setOrderLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Fetch tracking info
  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderTracking(orderId));
    }
    return () => {
      dispatch(clearTrackingInfo());
    };
  }, [dispatch, orderId]);

  const isLoading = orderLoading || trackingLoading;

  if (isLoading) {
    return (
      <div className="min-h-100 flex items-center justify-center">
        <RiLoader4Line className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  if (orderError || !order) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load order details</p>
        <Link
          to="/orders"
          className="text-green-600 hover:underline mt-4 inline-block"
        >
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const currentStep = mapStatusToStep(order.status);
  const isCancelled = order.status === "CANCELLED";

  const steps: TrackingStep[] = [
    {
      key: "placed",
      label: "Order Placed",
      description: "Your order has been placed successfully.",
      icon: RiShoppingBagLine,
      done: currentStep >= 0,
      timestamp: order.createdAt,
    },
    {
      key: "confirmed",
      label: "Order Confirmed",
      description: "Seller has confirmed your order.",
      icon: RiFileListLine,
      done: currentStep >= 1,
    },
    {
      key: "paid",
      label: "Payment Completed",
      description: "Payment has been processed successfully.",
      icon: RiWallet3Line,
      done: currentStep >= 2,
    },
    {
      key: "shipped",
      label: "Shipped",
      description: "Order has been picked up and is in transit.",
      icon: RiTruckLine,
      done: currentStep >= 3,
    },
    {
      key: "out_for_delivery",
      label: "Out for Delivery",
      description: "Delivery partner is on the way to your location.",
      icon: RiMapPinLine,
      done: currentStep >= 4,
    },
    {
      key: "delivered",
      label: "Delivered",
      description: "Order has been delivered to your address.",
      icon: RiCheckDoubleLine,
      done: currentStep >= 5,
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
      >
        <RiArrowLeftLine size={16} />
        Back to Orders
      </Link>

      {/* Order Header */}
      <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Order #{order.id}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              isCancelled
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : currentStep >= 5
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            }`}
          >
            {isCancelled
              ? "Cancelled"
              : order.status?.replace(/_/g, " ") || "Processing"}
          </div>
        </div>

        {/* Product Details */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-4">
            {order.productImage ? (
              <img
                src={order.productImage}
                alt={order.productName}
                className="w-20 h-20 rounded-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <RiShoppingBagLine size={32} className="text-slate-400" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {order.productName}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Quantity: {order.quantity}
              </p>
              <p className="text-lg font-bold text-green-600 mt-2">
                ₹{Number(order.totalPrice).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking Timeline */}
      {!isCancelled && (
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Tracking Timeline
          </h2>

          <div className="relative">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = step.done;
              const isLast = index === steps.length - 1;
              const Icon = step.icon;

              return (
                <div key={step.key} className="flex gap-4">
                  {/* Line + Icon */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 ${
                        isActive
                          ? "border-green-600 bg-green-50 dark:bg-green-900/20 text-green-600"
                          : isCompleted
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 text-slate-400"
                      }`}
                    >
                      {isCompleted && !isActive ? (
                        <RiCheckboxCircleLine size={20} />
                      ) : (
                        <Icon size={20} />
                      )}
                    </div>
                    {!isLast && (
                      <div
                        className={`w-0.5 flex-1 min-h-10 ${
                          isCompleted
                            ? "bg-green-500"
                            : "bg-slate-200 dark:bg-slate-700"
                        }`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`pb-8 ${isLast ? "pb-0" : ""}`}>
                    <h3
                      className={`font-semibold ${
                        isActive || isCompleted
                          ? "text-slate-900 dark:text-white"
                          : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {step.label}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {step.description}
                    </p>
                    {step.timestamp && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                        <RiTimeLine size={12} />
                        {new Date(step.timestamp).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Shipping Details */}
      {order.awbCode && (
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Shipment Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Courier
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {order.courierName || "Shiprocket"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Tracking Number (AWB)
              </p>
              <p className="font-semibold text-slate-900 dark:text-white font-mono">
                {order.awbCode}
              </p>
            </div>
            {order.estimatedDelivery && (
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Estimated Delivery
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {new Date(order.estimatedDelivery).toLocaleDateString(
                    "en-IN",
                    {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              </div>
            )}
            {trackingInfo?.currentLocation && (
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Current Location
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {trackingInfo.currentLocation}
                </p>
              </div>
            )}
          </div>
          {trackingInfo?.trackingUrl && (
            <a
              href={trackingInfo.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Track on Courier Website
              <RiExternalLinkLine size={14} />
            </a>
          )}
        </div>
      )}

      {/* Tracking Activities */}
      {trackingInfo?.trackingActivities &&
        trackingInfo.trackingActivities.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Tracking History
            </h2>
            <div className="space-y-4">
              {trackingInfo.trackingActivities.map((activity, index) => (
                <div key={index} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-slate-900 dark:text-white font-medium">
                      {activity.activity}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      {activity.location} • {activity.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Delivery Address */}
      {order.shippingAddress && (
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Delivery Address
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            {order.shippingAddress}
            {order.shippingCity && `, ${order.shippingCity}`}
            {order.shippingState && `, ${order.shippingState}`}
            {order.shippingPincode && ` - ${order.shippingPincode}`}
          </p>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Need Help?
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          If you have any questions about your order, please contact our support
          team.
        </p>
        <a
          href="/contact"
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <RiPhoneLine size={16} />
          Contact Support
        </a>
      </div>
    </div>
  );
}
