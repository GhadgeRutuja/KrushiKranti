import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  RiArrowLeftLine,
  RiCheckboxCircleLine,
  RiTruckLine,
  RiMapPinLine,
  RiTimeLine,
  RiLoader4Line,
  RiExternalLinkLine,
  RiShoppingBagLine,
  RiWallet3Line,
  RiAlertLine,
  RiStarFill,
  RiStarLine,
} from "react-icons/ri";
import api from "../../../services/api";
import { useAppSelector } from "../../../shared/hooks";
import toast from "react-hot-toast";

// ── Types ─────────────────────────────────────────────────────────────────────

interface BulkOrderData {
  id: number;
  productName: string;
  quantity: number;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  deliveryStatus: string;
  farmerId: number;
  farmerName: string;
  wholesalerId: number;
  wholesalerName: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  courierName?: string;
  awbCode?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  createdAt: string;
}

interface TrackingActivity {
  date?: string;
  activity?: string;
  description?: string;
  location?: string;
  [key: string]: string | undefined;
}

interface TrackingData {
  success: boolean;
  message?: string;
  awbCode?: string;
  currentStatus?: string;
  currentLocation?: string;
  estimatedDelivery?: string;
  trackingUrl?: string;
  courierName?: string;
  trackingActivities?: TrackingActivity[];
  orderStatus?: string;
  deliveryStatus?: string;
}

// ── Delivery Status Steps ─────────────────────────────────────────────────────

const DELIVERY_STEPS = [
  {
    key: "ORDER_PLACED",
    label: "Order Confirmed",
    icon: RiShoppingBagLine,
    description: "Payment received and order confirmed",
  },
  {
    key: "PAYMENT_DONE",
    label: "Payment Verified",
    icon: RiWallet3Line,
    description: "Payment verified and amount processed",
  },
  {
    key: "PICKUP_SCHEDULED",
    label: "Pickup Scheduled",
    icon: RiTimeLine,
    description: "Courier pickup scheduled from farmer",
  },
  {
    key: "PICKED_UP",
    label: "Picked Up",
    icon: RiCheckboxCircleLine,
    description: "Parcel picked up by courier",
  },
  {
    key: "IN_TRANSIT",
    label: "In Transit",
    icon: RiTruckLine,
    description: "Package on the way to you",
  },
  {
    key: "OUT_FOR_DELIVERY",
    label: "Out for Delivery",
    icon: RiMapPinLine,
    description: "Package out for final delivery",
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    icon: RiCheckboxCircleLine,
    description: "Package delivered successfully",
  },
];

const DELIVERY_STATUS_INDEX: Record<string, number> = {
  NOT_SHIPPED: 0,
  PICKUP_SCHEDULED: 2,
  PICKED_UP: 3,
  IN_TRANSIT: 4,
  OUT_FOR_DELIVERY: 5,
  DELIVERED: 6,
  RETURNED: 3,
};

function getStepIndex(deliveryStatus: string): number {
  return DELIVERY_STATUS_INDEX[deliveryStatus?.toUpperCase()] ?? 0;
}

// ── FarmerRatingModal ─────────────────────────────────────────────────────────

interface RatingModalProps {
  orderId: number;
  farmerName: string;
  onClose: () => void;
  onSuccess: () => void;
}

function FarmerRatingModal({ orderId, farmerName, onClose, onSuccess }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (rating === 0) { toast.error("Please select a rating"); return; }
    setSubmitting(true);
    try {
      await api.post("/farmer-ratings", { orderId, rating, review: review.trim() || undefined });
      toast.success("Rating submitted!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Rate Farmer</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
          How was your experience with <strong>{farmerName}</strong>?
        </p>

        {/* Star picker */}
        <div className="flex gap-2 justify-center mb-5">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(s)}
              className="text-3xl transition-transform hover:scale-110"
            >
              {s <= (hover || rating) ? (
                <RiStarFill className="text-yellow-400" />
              ) : (
                <RiStarLine className="text-slate-300 dark:text-slate-600" />
              )}
            </button>
          ))}
        </div>

        {/* Review textarea */}
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={3}
          placeholder="Write a short review (optional)"
          maxLength={500}
          className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-green-500 resize-none mb-4"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting || rating === 0}
            className="flex-1 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
          >
            {submitting ? "Submitting…" : "Submit Rating"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BulkOrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAppSelector((state) => state.auth);

  const [order, setOrder] = useState<BulkOrderData | null>(null);
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [alreadyRated, setAlreadyRated] = useState(false);

  const load = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const [orderRes, trackRes] = await Promise.allSettled([
        api.get(`/bulk-payments/orders/${orderId}`),
        api.get(`/bulk-payments/orders/${orderId}/track`),
      ]);

      if (orderRes.status === "fulfilled") {
        setOrder(orderRes.value.data.data as BulkOrderData);
      } else {
        setError("Failed to load order details.");
      }

      if (trackRes.status === "fulfilled") {
        setTracking(trackRes.value.data.data as TrackingData);
      }
    } catch {
      setError("Failed to load tracking data.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <RiLoader4Line className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <RiAlertLine size={48} className="text-red-500" />
        <p className="text-slate-600 dark:text-slate-400">
          {error ?? "Order not found."}
        </p>
        <Link
          to=".."
          className="text-green-600 text-sm font-medium flex items-center gap-1"
        >
          <RiArrowLeftLine size={16} /> Go back
        </Link>
      </div>
    );
  }

  const activeDeliveryStatus = tracking?.deliveryStatus ?? order.deliveryStatus;
  const currentStep = getStepIndex(activeDeliveryStatus);

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      {/* Back link */}
      <Link
        to=".."
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-green-600 transition-colors"
      >
        <RiArrowLeftLine size={16} />
        Back
      </Link>

      {/* Order summary card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">
              Bulk Order #{order.id}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {order.productName} · {order.quantity} kg
            </p>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              order.deliveryStatus === "DELIVERED"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : order.deliveryStatus === "IN_TRANSIT" ||
                    order.deliveryStatus === "OUT_FOR_DELIVERY"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            }`}
          >
            {activeDeliveryStatus.replace(/_/g, " ")}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400 dark:text-slate-500">Farmer</span>
            <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">
              {order.farmerName}
            </p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500">Buyer</span>
            <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">
              {order.wholesalerName}
            </p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500">Total</span>
            <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">
              ₹{Number(order.totalAmount).toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500">Courier</span>
            <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">
              {tracking?.courierName ?? order.courierName ?? "Pending"}
            </p>
          </div>
          {(tracking?.estimatedDelivery ?? order.estimatedDelivery) && (
            <div className="col-span-2">
              <span className="text-slate-400 dark:text-slate-500">
                Estimated Delivery
              </span>
              <p className="font-medium text-green-600 dark:text-green-400 mt-0.5">
                {tracking?.estimatedDelivery ?? order.estimatedDelivery}
              </p>
            </div>
          )}
          {(tracking?.trackingUrl ?? order.trackingUrl) && (
            <div className="col-span-2">
              <a
                href={tracking?.trackingUrl ?? order.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-green-600 font-medium text-xs hover:underline"
              >
                Track on courier site <RiExternalLinkLine size={12} />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Progress timeline */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
          Delivery Progress
        </h2>
        <ol className="relative border-l-2 border-slate-100 dark:border-slate-800 space-y-5 pl-6">
          {DELIVERY_STEPS.map((step, i) => {
            const done = i <= currentStep;
            const active = i === currentStep;
            const Icon = step.icon;
            return (
              <li key={step.key} className="relative">
                {/* Circle marker */}
                <span
                  className={`absolute -left-[29px] w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                    done
                      ? "bg-green-500 border-green-500"
                      : "bg-white dark:bg-gray-900 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <Icon
                    size={13}
                    className={
                      done ? "text-white" : "text-slate-300 dark:text-slate-600"
                    }
                  />
                </span>
                <div
                  className={
                    active ? "opacity-100" : done ? "opacity-70" : "opacity-35"
                  }
                >
                  <p
                    className={`text-sm font-semibold ${
                      active
                        ? "text-green-600 dark:text-green-400"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Activity log from Shiprocket */}
      {tracking?.success &&
        tracking.trackingActivities &&
        tracking.trackingActivities.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Activity Log
            </h2>
            <ol className="space-y-3">
              {tracking.trackingActivities.map((activity, idx) => (
                <li key={idx} className="flex gap-3 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      {activity.activity ?? activity.description ?? "Update"}
                    </p>
                    {activity.location && (
                      <p className="text-slate-400 dark:text-slate-500">
                        {activity.location}
                      </p>
                    )}
                    {activity.date && (
                      <p className="text-slate-400 dark:text-slate-500">
                        {activity.date}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

      {/* Rate Farmer button (wholesaler only, after delivery) */}
      {user?.role === "wholesaler" &&
        order.deliveryStatus === "DELIVERED" &&
        !alreadyRated && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Rate your experience
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                How was your deal with {order.farmerName}?
              </p>
            </div>
            <button
              onClick={() => setShowRatingModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <RiStarFill size={14} /> Rate Farmer
            </button>
          </div>
        )}

      {/* Rating Modal */}
      {showRatingModal && (
        <FarmerRatingModal
          orderId={order.id}
          farmerName={order.farmerName}
          onClose={() => setShowRatingModal(false)}
          onSuccess={() => setAlreadyRated(true)}
        />
      )}
    </div>
  );
}

