import { useState, useMemo, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../shared/hooks";
import {
  fetchFarmerOrders,
  setFilters,
  setPage,
} from "../../orders/orderSlice";
import { orderService } from "../../orders/orderService";
import type { Order, OrderStatus } from "../../orders/types";
import toast from "react-hot-toast";
import {
  RiSearchLine,
  RiFilterLine,
  RiEyeLine,
  RiEditLine,
  RiMessage2Line,
  RiCloseLine,
  RiShoppingBagLine,
  RiTruckLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiTimeLine,
  RiFileListLine,
  RiMapPinLine,
  RiUserLine,
  RiArrowUpDownLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiCarLine,
  RiRefreshLine,
  RiLoader4Line,
  RiMoneyDollarCircleLine,
} from "react-icons/ri";

/* ══════════════════════════════════════════════════════
   Status config
══════════════════════════════════════════════════════ */
const STATUS_META: Record<
  string,
  { label: string; icon: React.ElementType; badge: string }
> = {
  PENDING: {
    label: "Pending",
    icon: RiTimeLine,
    badge:
      "text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: RiFileListLine,
    badge:
      "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800",
  },
  PROCESSING: {
    label: "Processing",
    icon: RiMoneyDollarCircleLine,
    badge:
      "text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800",
  },
  SHIPPED: {
    label: "Shipped",
    icon: RiTruckLine,
    badge:
      "text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-900/20 dark:border-purple-800",
  },
  DELIVERED: {
    label: "Delivered",
    icon: RiCheckboxCircleLine,
    badge:
      "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: RiCloseCircleLine,
    badge:
      "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800",
  },
  REFUNDED: {
    label: "Refunded",
    icon: RiMoneyDollarCircleLine,
    badge:
      "text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800",
  },
  pending: {
    label: "Pending",
    icon: RiTimeLine,
    badge:
      "text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800",
  },
  confirmed: {
    label: "Confirmed",
    icon: RiFileListLine,
    badge:
      "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800",
  },
  processing: {
    label: "Processing",
    icon: RiMoneyDollarCircleLine,
    badge:
      "text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800",
  },
  shipped: {
    label: "Shipped",
    icon: RiTruckLine,
    badge:
      "text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-900/20 dark:border-purple-800",
  },
  delivered: {
    label: "Delivered",
    icon: RiCheckboxCircleLine,
    badge:
      "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800",
  },
  cancelled: {
    label: "Cancelled",
    icon: RiCloseCircleLine,
    badge:
      "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800",
  },
};

type TimelineStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED";
const TIMELINE_STEPS: TimelineStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];
const STEP_ORDER: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: -1,
  REFUNDED: -1,
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
  refunded: -1,
};

/* ══════════════════════════════════════════════════════
   Summary stat card
══════════════════════════════════════════════════════ */
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${bg}`}
      >
        <Icon size={18} className={color} />
      </div>
      <div>
        <p className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums">
          {value}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   Order Timeline
══════════════════════════════════════════════════════ */
function OrderTimeline({ status }: { status: string }) {
  const normalizedStatus = status?.toUpperCase() || "PLACED";
  const current = STEP_ORDER[normalizedStatus] ?? STEP_ORDER[status] ?? 0;
  if (normalizedStatus === "CANCELLED") {
    return (
      <div className="flex items-center gap-2 text-red-500 text-sm font-semibold">
        <RiCloseCircleLine size={16} /> Order Cancelled
      </div>
    );
  }
  return (
    <div className="relative mt-2">
      {TIMELINE_STEPS.map((step, idx) => {
        const meta = STATUS_META[step];
        const Icon = meta.icon;
        const done = idx <= current;
        const active = idx === current;
        return (
          <div key={step} className="flex items-start gap-3 mb-0">
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0 ${active
                  ? "border-green-600 bg-green-600 text-white"
                  : done
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 text-slate-300"
                  }`}
              >
                <Icon size={13} />
              </div>
              {idx < TIMELINE_STEPS.length - 1 && (
                <div
                  className={`w-0.5 h-6 mt-0.5 rounded-full ${idx < current ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"}`}
                />
              )}
            </div>
            <p
              className={`text-xs pt-1 font-semibold ${active ? "text-green-600 dark:text-green-400" : done ? "text-slate-700 dark:text-slate-300" : "text-slate-300 dark:text-slate-600"}`}
            >
              {meta.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   Order Detail Modal
══════════════════════════════════════════════════════ */
function OrderModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const meta = STATUS_META[order.status] || STATUS_META.PENDING;
  const Icon = meta.icon;
  const total = Number(order.totalAmount ?? order.totalPrice ?? 0);
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    : "";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-end bg-black/40 backdrop-blur-[2px]">
      <div className="w-full max-w-md h-full bg-white dark:bg-gray-900 border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-2xl">
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Order #{order.id}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{orderDate}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RiCloseLine size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status badge */}
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${meta.badge}`}
            >
              <Icon size={12} />
              {meta.label}
            </span>
            <span className="text-xl font-extrabold text-green-700 dark:text-green-400">
              ₹{total.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Product */}
          <section>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Product
            </p>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
              {order.productImage && (
                <img
                  src={order.productImage}
                  alt={order.productName || "Product"}
                  className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/56";
                  }}
                />
              )}
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {order.productName || "Product"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Qty: {order.quantity}
                </p>
              </div>
            </div>
          </section>

          {/* Customer */}
          <section>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Customer
            </p>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                <RiUserLine size={14} className="text-slate-400 shrink-0" />
                <span className="font-semibold">
                  {order.userName || order.userEmail}
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                <RiMapPinLine
                  size={14}
                  className="text-slate-400 shrink-0 mt-0.5"
                />
                <span>{order.shippingAddress}</span>
              </div>
            </div>
          </section>

          {/* Earnings */}
          <section>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Earnings
            </p>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Your Earnings</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  ₹{Number(order.farmerAmount ?? 0).toLocaleString("en-IN")}
                </p>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${order.paymentStatus === "completed"
                  ? "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30"
                  : order.paymentStatus === "pending"
                    ? "text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30"
                    : "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
                  }`}
              >
                {order.paymentStatus}
              </span>
            </div>
          </section>

          {/* Timeline */}
          <section>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Order Timeline
            </p>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <OrderTimeline status={order.status} />
            </div>
          </section>
        </div>

        {/* Drawer footer actions */}
        <div className="shrink-0 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            <RiEditLine size={14} /> Update Status
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <RiMessage2Line size={14} /> Contact Buyer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   Status badge component
══════════════════════════════════════════════════════ */
function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] || STATUS_META.PENDING;
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold whitespace-nowrap ${meta.badge}`}
    >
      <Icon size={10} />
      {meta.label}
    </span>
  );
}

/* ══════════════════════════════════════════════════════
   Main Page
══════════════════════════════════════════════════════ */
const ALL_STATUSES: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

type SortKey = "date" | "total" | "status";

interface FarmerStats {
  totalOrders: number;
  totalEarnings: number;
  pendingOrders: number;
  completedOrders: number;
}

export function FarmerOrdersPage() {
  const dispatch = useAppDispatch();
  const {
    orders,
    isLoading,
    error: _error,
    filters: _filters,
    pagination,
  } = useAppSelector((state) => state.orders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [stats, setStats] = useState<FarmerStats | null>(null);

  /* ── Fetch orders on mount and when filters change ── */
  useEffect(() => {
    dispatch(
      fetchFarmerOrders({
        status: statusFilter,
        page: pagination.page,
        limit: pagination.limit || 10,
      }),
    );
  }, [dispatch, statusFilter, pagination.page, pagination.limit]);

  /* ── Fetch farmer stats ── */
  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await orderService.getFarmerStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load farmer stats:", err);
      }
    };
    loadStats();
  }, []);

  /* ── Derived stats ── */
  const total = stats?.totalOrders ?? orders.length;
  const pending = stats?.pendingOrders ?? 0;
  const completed = stats?.completedOrders ?? 0;
  const totalEarnings = stats?.totalEarnings ?? 0;

  /* ── Filter + sort ── */
  const filtered = useMemo(() => {
    let list = orders.filter((o) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        o.id?.toString().toLowerCase().includes(q) ||
        o.productName?.toLowerCase().includes(q) ||
        o.userName?.toLowerCase().includes(q) ||
        o.userEmail?.toLowerCase().includes(q);
      return matchSearch;
    });

    list = [...list].sort((a, b) => {
      let cmp = 0;
      const aTotal = Number(a.totalAmount ?? a.totalPrice ?? 0);
      const bTotal = Number(b.totalAmount ?? b.totalPrice ?? 0);
      if (sortKey === "total") cmp = aTotal - bTotal;
      if (sortKey === "status")
        cmp = (a.status ?? "").localeCompare(b.status ?? "");
      if (sortKey === "date")
        cmp = (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
      return sortAsc ? cmp : -cmp;
    });

    return list;
  }, [orders, search, sortKey, sortAsc]);

  const handleStatusFilter = (status: OrderStatus | "all") => {
    setStatusFilter(status);
    dispatch(setFilters({ status }));
  };

  const handleRefresh = () => {
    dispatch(
      fetchFarmerOrders({
        status: statusFilter,
        page: pagination.page,
        limit: pagination.limit || 10,
      }),
    );
    toast.success("Orders refreshed");
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col)
      return <RiArrowUpDownLine size={11} className="text-slate-300" />;
    return sortAsc ? (
      <RiArrowUpSLine size={12} className="text-green-600" />
    ) : (
      <RiArrowDownSLine size={12} className="text-green-600" />
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Page heading ── */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Orders
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage incoming orders, update statuses, and track earnings.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <RiRefreshLine size={16} />
          Refresh
        </button>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          value={total}
          icon={RiShoppingBagLine}
          color="text-slate-600"
          bg="bg-slate-100 dark:bg-slate-800"
        />
        <StatCard
          label="Total Earnings"
          value={`₹${totalEarnings.toLocaleString("en-IN")}`}
          icon={RiMoneyDollarCircleLine}
          color="text-green-600"
          bg="bg-green-50 dark:bg-green-900/20"
        />
        <StatCard
          label="Pending Orders"
          value={pending}
          icon={RiTimeLine}
          color="text-yellow-600"
          bg="bg-yellow-50 dark:bg-yellow-900/20"
        />
        <StatCard
          label="Completed"
          value={completed}
          icon={RiCheckboxCircleLine}
          color="text-emerald-600"
          bg="bg-emerald-50 dark:bg-emerald-900/20"
        />
      </div>

      {/* ── Toolbar: search + status filter ── */}
      <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          {/* Search */}
          <div className="relative flex-1 w-full sm:max-w-xs">
            <RiSearchLine
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID, product or buyer…"
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-gray-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <RiFilterLine size={13} className="text-slate-400 shrink-0" />
            {ALL_STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => handleStatusFilter(s.value)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${statusFilter === s.value
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-transparent text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {[
                  { label: "Order ID", key: null },
                  { label: "Product", key: null },
                  { label: "Customer", key: null },
                  { label: "Qty", key: null },
                  { label: "Total", key: "total" as SortKey },
                  { label: "Your Earnings", key: null },
                  { label: "Date", key: "date" as SortKey },
                  { label: "Status", key: "status" as SortKey },
                  { label: "Actions", key: null },
                ].map(({ label, key }) => (
                  <th
                    key={label}
                    onClick={() => key && toggleSort(key)}
                    className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap ${key ? "cursor-pointer select-none hover:text-slate-600 dark:hover:text-slate-200" : ""}`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {label}
                      {key && <SortIcon col={key} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <RiLoader4Line
                      className="animate-spin text-green-600 mx-auto"
                      size={32}
                    />
                    <p className="text-sm text-slate-400 mt-2">
                      Loading orders...
                    </p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-16 text-center text-sm text-slate-400"
                  >
                    No orders found for the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const orderTotal = Number(
                    order.totalAmount ?? order.totalPrice ?? 0,
                  );
                  const farmerEarnings = Number(order.farmerAmount ?? 0);
                  const orderDate = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                    : "";

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Order ID */}
                      <td className="px-4 py-3.5">
                        <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                          #{order.id}
                        </p>
                      </td>

                      {/* Product */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {order.productImage ? (
                            <img
                              src={order.productImage}
                              alt={order.productName || "Product"}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://via.placeholder.com/36";
                              }}
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                              <RiShoppingBagLine
                                size={16}
                                className="text-slate-400"
                              />
                            </div>
                          )}
                          <p className="text-sm font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                            {order.productName || "Product"}
                          </p>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                          {order.userName || order.userEmail || "Customer"}
                        </p>
                      </td>

                      {/* Quantity */}
                      <td className="px-4 py-3.5 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {order.quantity ?? "-"}
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                          ₹{orderTotal.toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Farmer Earnings */}
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          ₹{farmerEarnings.toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {orderDate}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={order.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setActiveOrder(order)}
                            title="View Details"
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                          >
                            <RiEyeLine size={15} />
                          </button>
                          <button
                            title="Update Status"
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            <RiEditLine size={15} />
                          </button>
                          <button
                            title="Track Order"
                            onClick={() => window.open(`/orders/${order.id}/track`, "_blank")}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                          >
                            <RiCarLine size={15} />
                          </button>
                          <button
                            title="Contact Customer"
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                          >
                            <RiMessage2Line size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer with pagination */}
        {!isLoading && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Showing{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {filtered.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {pagination.total}
              </span>{" "}
              orders
            </p>
            <div className="flex items-center gap-2">
              {pagination.totalPages > 1 && (
                <>
                  <button
                    onClick={() => dispatch(setPage(pagination.page - 1))}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-slate-500">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => dispatch(setPage(pagination.page + 1))}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Next
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Order Detail Drawer ── */}
      {activeOrder && (
        <OrderModal order={activeOrder} onClose={() => setActiveOrder(null)} />
      )}
    </div>
  );
}
