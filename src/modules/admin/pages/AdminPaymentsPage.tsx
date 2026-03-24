import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, IndianRupee, CreditCard, CheckCircle, Clock } from "lucide-react";
import { orderService } from "../../orders/orderService";
import type { Order } from "../../orders/types";
import { useTranslation } from "react-i18next";

export function AdminPaymentsPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState<{ totalRevenue: number; totalOrders: number; totalCommission: number } | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderService.getAllOrders(page, 15);
      setOrders(res.data);
      setTotalPages(res.totalPages);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPayments();
    orderService.getAdminStats().then(setStats).catch(() => {});
  }, [fetchPayments]);

  const filtered = search
    ? orders.filter(
        (o) =>
          String(o.id).includes(search) ||
          (o.paymentMethod ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  const paymentStatusBadge: Record<string, string> = {
    paid: "bg-green-100 text-green-700",
    completed: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
    refunded: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="text-green-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("adminPages.payments.title")}</h1>
        </div>
        <p className="text-sm text-gray-500">{t("adminPages.payments.subtitle")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-600 text-white rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <IndianRupee size={20} />
            </div>
          </div>
          <p className="text-green-100 text-xs uppercase font-medium">{t("adminPages.payments.total_revenue")}</p>
          <p className="text-2xl font-bold">₹{stats ? stats.totalRevenue.toLocaleString() : "—"}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <CheckCircle className="text-blue-600" size={20} />
            </div>
          </div>
          <p className="text-gray-500 text-xs uppercase font-medium">{t("adminPages.payments.total_transactions")}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats ? stats.totalOrders : "—"}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
              <Clock className="text-yellow-600" size={20} />
            </div>
          </div>
          <p className="text-gray-500 text-xs uppercase font-medium">{t("adminPages.payments.platform_commission")}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats ? stats.totalCommission.toLocaleString() : "—"}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t("adminPages.payments.search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-green-600" size={36} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <CreditCard className="mx-auto text-gray-400 mb-2" size={48} />
          <p className="text-gray-500">{t("adminPages.payments.empty")}</p>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-green-50 dark:bg-green-900/20">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 dark:text-green-400 uppercase">{t("adminPages.payments.col_order_id")}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 dark:text-green-400 uppercase">{t("adminPages.payments.col_date")}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 dark:text-green-400 uppercase">{t("adminPages.payments.col_method")}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 dark:text-green-400 uppercase">{t("adminPages.payments.col_status")}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-green-800 dark:text-green-400 uppercase">{t("adminPages.payments.col_amount")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-sm font-medium text-green-600">ORD-{order.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {order.paymentMethod ?? t("adminPages.payments.online")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${paymentStatusBadge[order.paymentStatus ?? "pending"] ?? "bg-gray-100 text-gray-500"}`}>
                        {order.paymentStatus ?? "pending"}
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
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${paymentStatusBadge[order.paymentStatus ?? "pending"] ?? ""}`}>
                    {order.paymentStatus ?? "pending"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  {new Date(order.createdAt).toLocaleDateString()} · {order.paymentMethod ?? t("adminPages.payments.online")}
                </p>
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
                {t("adminPages.payments.page_of", { page, totalPages })}
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
