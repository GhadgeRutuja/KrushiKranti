import { useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  RiArrowLeftLine,
  RiTruckLine,
  RiShoppingBagLine,
  RiCheckboxCircleLine,
  RiMapPinLine,
  RiLoader4Line,
  RiAlertLine,
  RiFileListLine,
  RiTimeLine,
  RiRefund2Line,
} from "react-icons/ri";
import { FiDownload } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../../shared/hooks";
import { fetchOrderById } from "../orderSlice";
import type { OrderStatus } from "../types";
import { generateInvoicePdf } from "../../../components/invoice/InvoiceTemplate.tsx";

// ── helpers ──────────────────────────────────────────────────────────────────

function fmt(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

const statusBadge: Record<string, string> = {
  pending:
    "text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800",
  confirmed:
    "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800",
  processing:
    "text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-900/20 dark:border-indigo-800",
  shipped:
    "text-violet-700 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-900/20 dark:border-violet-800",
  out_for_delivery:
    "text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800",
  delivered:
    "text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800",
  cancelled:
    "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800",
  refunded:
    "text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700",
};

const paymentBadge: Record<string, string> = {
  completed:
    "text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800",
  pending:
    "text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800",
  failed:
    "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800",
};

// ── Step definitions for the visual timeline ─────────────────────────────────

type Step = { key: OrderStatus; label: string; icon: React.ElementType };

const STEPS: Step[] = [
  { key: "pending", label: "Order Placed", icon: RiShoppingBagLine },
  { key: "confirmed", label: "Confirmed", icon: RiCheckboxCircleLine },
  { key: "processing", label: "Processing", icon: RiTimeLine },
  { key: "shipped", label: "Shipped", icon: RiTruckLine },
  { key: "delivered", label: "Delivered", icon: RiMapPinLine },
];

const STATUS_STEP_INDEX: Partial<Record<string, number>> = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  out_for_delivery: 3, // treat as shipped for progress
  cancelled: -1,
  refunded: -1,
};

// ── Component ─────────────────────────────────────────────────────────────────

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    selectedOrder: order,
    isLoading,
    error,
  } = useAppSelector((s) => s.orders);
  const authUser = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (id) dispatch(fetchOrderById(id));
  }, [id, dispatch]);

  // ── loading ──
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-3">
        <RiLoader4Line className="animate-spin text-green-600" size={32} />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading order details…
        </p>
      </div>
    );
  }

  // ── error ──
  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <RiAlertLine size={36} className="text-red-400" />
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {error ?? "Order not found."}
        </p>
        <button
          onClick={() => navigate("/orders")}
          className="text-sm font-medium text-green-700 dark:text-green-400 underline"
        >
          Back to My Orders
        </button>
      </div>
    );
  }

  const statusNorm = (order.status ?? "pending").toLowerCase() as string;
  const currentStep = STATUS_STEP_INDEX[statusNorm] ?? 0;
  const isCancelled = statusNorm === "cancelled" || statusNorm === "refunded";

  const canDownloadInvoice =
    (order.paymentStatus ?? "").toLowerCase() === "completed";

  const handleDownloadInvoice = () => {
    if (!order || !order.items || order.items.length === 0) {
      toast.error("Order data is missing. Unable to generate invoice.");
      return;
    }

    // Additional client-side ownership guard for the order details page.
    if (authUser?.role === "user" && String(order.userId || "") !== String(authUser.id)) {
      toast.error("You are not allowed to download this invoice.");
      return;
    }

    try {
      generateInvoicePdf(order);
      toast.success("Invoice downloaded successfully");
    } catch {
      toast.error("Invoice generation failed. Please try again.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-10">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <Link
          to="/orders"
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <RiArrowLeftLine size={16} />
        </Link>
        <div className="flex-1">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Order Details
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            #{order.id}
          </p>
        </div>

        {canDownloadInvoice && (
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-3 py-2 rounded-lg transition-colors"
          >
            <FiDownload size={13} /> Download Invoice
          </button>
        )}

        {(statusNorm === "shipped" ||
          statusNorm === "processing" ||
          statusNorm === "out_for_delivery") && (
          <Link
            to={`/orders/${order.id}/track`}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg transition-colors"
          >
            <RiTruckLine size={13} /> Track Order
          </Link>
        )}
      </div>

      {/* ── Status Banner ── */}
      <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Order Status
            </p>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold capitalize ${statusBadge[statusNorm] ?? statusBadge["pending"]}`}
            >
              {isCancelled && <RiRefund2Line size={12} />}
              {statusNorm.replace(/_/g, " ")}
            </span>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Placed on
            </p>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {fmt(order.createdAt)}
            </p>
          </div>
        </div>

        {/* ── Progress Timeline ── */}
        {!isCancelled && (
          <div className="mt-2">
            <div className="flex items-start justify-between relative">
              {/* connector line */}
              <div className="absolute top-3.5 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800 z-0" />
              <div
                className="absolute top-3.5 left-0 h-0.5 bg-green-500 z-0 transition-all duration-500"
                style={{
                  width:
                    currentStep === 0
                      ? "0%"
                      : `${(currentStep / (STEPS.length - 1)) * 100}%`,
                }}
              />
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const done = idx <= currentStep;
                const active = idx === currentStep;
                return (
                  <div
                    key={step.key}
                    className="flex flex-col items-center gap-1.5 z-10"
                    style={{ width: `${100 / STEPS.length}%` }}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                        done
                          ? "bg-green-600 border-green-600 text-white"
                          : active
                            ? "border-yellow-400 text-yellow-500 bg-white dark:bg-gray-900"
                            : "border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 bg-white dark:bg-gray-900"
                      }`}
                    >
                      <Icon size={13} />
                    </div>
                    <span
                      className={`text-[9px] text-center leading-tight font-medium ${done ? "text-green-700 dark:text-green-400" : "text-slate-400 dark:text-slate-600"}`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="flex items-center gap-2 mt-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
            <RiAlertLine size={16} className="text-red-500 shrink-0" />
            <p className="text-xs text-red-700 dark:text-red-400">
              This order has been {statusNorm}.{" "}
              {order.paymentStatus === "completed"
                ? "A refund has been initiated."
                : "No payment was charged."}
            </p>
          </div>
        )}
      </div>

      {/* ── Products ── */}
      <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <RiFileListLine size={15} className="text-slate-400" />
            Items Ordered
          </h3>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-4">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 rounded-lg object-cover border border-slate-100 dark:border-slate-800 bg-slate-50"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <RiShoppingBagLine size={22} className="text-slate-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {item.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Qty: {item.quantity} {item.unit && <span>· {item.unit}</span>}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  ₹{item.price.toLocaleString("en-IN")} each
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Order Total ── */}
        <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Order Total
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-white">
              ₹{order.totalAmount.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* ── Shipping + Payment ── */}
      <div className="grid sm:grid-cols-2 gap-5">
        {/* Shipping Address */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
            <RiMapPinLine size={13} /> Delivery Address
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {order.shippingAddress}
            {order.shippingCity && `, ${order.shippingCity}`}
            {order.shippingState && `, ${order.shippingState}`}
            {order.shippingPincode && ` — ${order.shippingPincode}`}
          </p>
        </div>

        {/* Payment Info */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            Payment
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Method
              </span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 capitalize">
                {order.paymentMethod ?? "Online"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Status
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded border capitalize ${paymentBadge[order.paymentStatus ?? "pending"]}`}
              >
                {order.paymentStatus ?? "pending"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Amount
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                ₹{order.totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Shipment Info (if available) ── */}
      {(order.awbCode || order.courierName || order.shipmentId) && (
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
            <RiTruckLine size={13} /> Shipment Info
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {order.courierName && (
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                  Courier
                </p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                  {order.courierName}
                </p>
              </div>
            )}
            {order.awbCode && (
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                  AWB / Tracking No
                </p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-0.5 font-mono">
                  {order.awbCode}
                </p>
              </div>
            )}
            {order.estimatedDelivery && (
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                  Expected Delivery
                </p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                  {fmtDate(order.estimatedDelivery)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Footer Actions ── */}
      <div className="flex flex-wrap gap-3">
        <Link
          to="/orders"
          className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <RiArrowLeftLine size={14} /> Back to Orders
        </Link>
        {(statusNorm === "shipped" ||
          statusNorm === "processing" ||
          statusNorm === "out_for_delivery") && (
          <Link
            to={`/orders/${order.id}/track`}
            className="flex items-center gap-1.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-4 py-2.5 rounded-lg transition-colors"
          >
            <RiTruckLine size={14} /> Track Delivery
          </Link>
        )}
      </div>
    </div>
  );
}
