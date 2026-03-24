import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Truck, Package, MapPin } from "lucide-react";
import { orderService } from "../../orders/orderService";
import type { Order } from "../../orders/types";
import { useTranslation } from "react-i18next";

const statusBadge: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export function AdminShipmentsPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState<{ pendingOrders: number; shippedOrders: number; deliveredOrders: number } | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const status = statusFilter !== "all" ? statusFilter as any : undefined;
      const res = await orderService.getAllOrders(page, 15, status);
      setOrders(res.data);
      setTotalPages(res.totalPages);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
    orderService.getAdminStats().then(setStats).catch(() => {});
  }, [fetchOrders]);

  const filtered = search
    ? orders.filter(
        (o) =>
          String(o.id).includes(search) ||
          (o.shippingAddress ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Truck className="text-green-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("adminPages.shipments.title")}</h1>
        </div>
        <p className="text-sm text-gray-500">{t("adminPages.shipments.subtitle")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-yellow-200 dark:border-yellow-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="text-yellow-600" size={20} />
          </div>
          <p className="text-xs text-yellow-600 uppercase font-medium">{t("adminPages.shipments.pending_shipments")}</p>
          <p className="text-2xl font-bold text-yellow-600">{stats?.pendingOrders ?? "—"}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-purple-200 dark:border-purple-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="text-purple-600" size={20} />
          </div>
          <p className="text-xs text-purple-600 uppercase font-medium">{t("adminPages.shipments.in_transit")}</p>
          <p className="text-2xl font-bold text-purple-600">{stats?.shippedOrders ?? "—"}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-green-200 dark:border-green-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="text-green-600" size={20} />
          </div>
          <p className="text-xs text-green-600 uppercase font-medium">{t("adminPages.shipments.delivered")}</p>
          <p className="text-2xl font-bold text-green-600">{stats?.deliveredOrders ?? "—"}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t("adminPages.shipments.search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        >
          <option value="all">{t("adminPages.shipments.all_statuses")}</option>
          <option value="pending">{t("orders.status.pending")}</option>
          <option value="confirmed">{t("orders.status.processing")}</option>
          <option value="shipped">{t("orders.status.shipped")}</option>
          <option value="delivered">{t("orders.status.delivered")}</option>
          <option value="cancelled">{t("orders.status.cancelled")}</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-green-600" size={36} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <Truck className="mx-auto text-gray-400 mb-2" size={48} />
          <p className="text-gray-500">{t("adminPages.shipments.empty")}</p>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-green-50 dark:bg-green-900/20">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 dark:text-green-400 uppercase">{t("adminPages.shipments.col_order_id")}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 dark:text-green-400 uppercase">{t("adminPages.shipments.col_date")}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 dark:text-green-400 uppercase">{t("adminPages.shipments.col_shipping_address")}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 dark:text-green-400 uppercase">{t("adminPages.shipments.col_status")}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-green-800 dark:text-green-400 uppercase">{t("adminPages.shipments.col_amount")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-sm font-medium text-green-600">ORD-{order.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                      {order.shippingAddress || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusBadge[order.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white text-right">
                      ₹{order.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {filtered.map((order) => (
              <div key={order.id} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-600">ORD-{order.id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusBadge[order.status] ?? ""}`}>
                    {order.status.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                <p className="text-xs text-gray-400 mb-2 truncate">{order.shippingAddress || t("adminPages.shipments.no_address")}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{order.totalAmount.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 disabled:opacity-50"
              >
                {t("common.previous")}
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t("adminPages.shipments.page_of", { page, totalPages })}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 disabled:opacity-50"
              >
                {t("common.next")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
