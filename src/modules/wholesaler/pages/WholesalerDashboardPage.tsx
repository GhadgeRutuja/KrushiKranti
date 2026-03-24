import { useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  RiArrowRightSLine,
  RiArrowUpLine,
  RiFileListLine,
  RiShoppingBagLine,
  RiStarLine,
  RiArrowUpDownLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiTimeLine,
  RiMessage2Line,
  RiUserLine,
} from 'react-icons/ri';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../../shared/hooks';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchWholesalerStats, fetchRequests } from '../wholesalerSlice';

const supplierRatings = [
  { farmer: 'Rajiv Patel', product: 'Tomatoes', rating: 4.8, orders: 12 },
  { farmer: 'Anita Sharma', product: 'Basmati Rice', rating: 4.6, orders: 8 },
  { farmer: 'Suresh Kumar', product: 'Chillies', rating: 4.2, orders: 5 },
  { farmer: 'Lata Devi', product: 'Toor Dal', rating: 3.9, orders: 3 },
];

function StarBar({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <div
          key={s}
          className={`w-2.5 h-2.5 rounded-sm ${s <= Math.round(rating) ? 'bg-yellow-400' : 'bg-slate-200 dark:bg-slate-700'}`}
        />
      ))}
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1 tabular-nums">{rating}</span>
    </div>
  );
}

export function WholesalerDashboardPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { stats, requests } = useAppSelector((state) => state.wholesaler);

  useEffect(() => {
    dispatch(fetchWholesalerStats());
    dispatch(fetchRequests());
  }, [dispatch]);

  // Derive monthly purchase chart data from real orders
  const purchaseData = useMemo(() => {
    const monthMap: Record<string, number> = {};
    requests.forEach((r) => {
      const d = new Date(r.createdAt);
      if (isNaN(d.getTime())) return;
      const key = d.toLocaleString('en-US', { month: 'short' });
      monthMap[key] = (monthMap[key] ?? 0) + r.totalPrice;
    });
    return Object.entries(monthMap).map(([month, amount]) => ({ month, amount }));
  }, [requests]);

  // Show latest 4 requests in the dashboard table
  const recentRequests = requests.slice(0, 4);

  const STATUS_META: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
    pending: { label: t('wholesaler.status_pending'), cls: 'text-yellow-700 bg-yellow-50  border-yellow-200', icon: RiTimeLine },
    negotiating: { label: t('wholesaler.status_negotiating'), cls: 'text-blue-700   bg-blue-50    border-blue-200', icon: RiArrowUpDownLine },
    approved: { label: t('wholesaler.status_approved'), cls: 'text-green-700  bg-green-50   border-green-200', icon: RiCheckboxCircleLine },
    rejected: { label: t('wholesaler.status_rejected'), cls: 'text-red-700    bg-red-50     border-red-200', icon: RiCloseCircleLine },
  };

  const statCards = [
    { label: t('wholesaler.stat_inventory_value'), value: `₹${stats.totalInventoryValue.toLocaleString('en-IN')}`, sub: t('wholesaler.stat_inventory_value_sub'), icon: RiArrowUpLine },
    { label: t('wholesaler.stat_bulk_requests'), value: String(stats.totalRequests), sub: t('wholesaler.stat_bulk_requests_sub'), icon: RiFileListLine },
    { label: t('wholesaler.stat_inventory_items'), value: String(stats.inventoryItems), sub: t('wholesaler.stat_inventory_items_sub'), icon: RiShoppingBagLine },
    { label: t('wholesaler.stat_avg_rating'), value: '4.4', sub: t('wholesaler.stat_avg_rating_sub'), icon: RiStarLine },
  ];

  const tableHeaders = [
    t('wholesaler.col_id'),
    t('wholesaler.col_farmer'),
    t('wholesaler.col_product'),
    t('wholesaler.col_qty'),
    t('wholesaler.col_offered_price'),
    t('wholesaler.col_status'),
    '',
  ];

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('wholesaler.overview_title')}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t('wholesaler.overview_desc')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <s.icon size={18} className="text-slate-400 dark:text-slate-500" />
              <span className="text-[10px] font-medium text-slate-400">{s.sub}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Purchase Chart */}
      <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-5">{t('wholesaler.monthly_purchase')}</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={purchaseData}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={(v: number) => `₹${v / 1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '11px' }}
                formatter={(v: number | string | undefined) => [`₹${v}`, 'Purchased']}
              />
              <Bar dataKey="amount" fill="#eab308" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bulk Requests Table + Supplier Ratings */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Bulk Requests */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('wholesaler.bulk_purchase_requests')}</h3>
            <Link
              to="/wholesaler/bulk-requests"
              className="flex items-center gap-0.5 text-xs font-medium text-green-700 dark:text-green-400"
            >
              {t('wholesaler.all_requests')} <RiArrowRightSLine size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {tableHeaders.map((h, i) => (
                    <th key={i} className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                {recentRequests.length === 0 ? (
                  <tr>
                    <td colSpan={tableHeaders.length} className="px-5 py-6 text-center text-sm text-slate-400">
                      {t('wholesaler.no_requests')}
                    </td>
                  </tr>
                ) : (
                  recentRequests.map((req) => {
                    const meta = STATUS_META[req.status] ?? STATUS_META['pending'];
                    const Icon = meta.icon;
                    return (
                      <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="px-5 py-3 text-xs text-slate-400 font-mono">#{req.id.substring(0, 6)}</td>
                        <td className="px-5 py-3 text-sm font-medium text-slate-900 dark:text-white">{req.farmerName}</td>
                        <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300">{req.productName}</td>
                        <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300">{req.quantity} {req.unit}</td>
                        <td className="px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white">
                          ₹{req.pricePerUnit}/{req.unit}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-semibold ${meta.cls}`}>
                            <Icon size={10} />
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {req.status === 'pending' && (
                            <Link to="/wholesaler/chat" className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              <RiMessage2Line size={12} /> {t('chat.send')}
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Supplier Ratings */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('wholesaler.supplier_ratings')}</h3>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800/60">
            {supplierRatings.map((s) => (
              <div key={s.farmer} className="px-5 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0">
                  <RiUserLine size={14} className="text-slate-500 dark:text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{s.farmer}</p>
                  <p className="text-[10px] text-slate-400">{s.product} · {s.orders} {t('wholesaler.orders_label')}</p>
                  <StarBar rating={s.rating} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
