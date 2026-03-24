import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  RiShoppingBagLine,
  RiHeartLine,
  RiTruckLine,
  RiArrowRightSLine,
  RiCheckboxCircleLine,
  RiMapPinLine,
  RiArrowUpLine,
  RiLoader4Line,
  RiInboxUnarchiveLine,
} from 'react-icons/ri';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../shared/hooks';
import { fetchOrders } from '../../modules/orders/orderSlice';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EmptyState, TableRowSkeleton } from '../../shared/components/ui';

const spendData = [
  { month: 'Oct', amount: 840 },
  { month: 'Nov', amount: 1200 },
  { month: 'Dec', amount: 950 },
  { month: 'Jan', amount: 1800 },
  { month: 'Feb', amount: 1350 },
  { month: 'Mar', amount: 2100 },
];

const statusColors: Record<string, string> = {
  pending: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  processing: 'text-blue-700  bg-blue-50   border-blue-200',
  shipped: 'text-violet-700 bg-violet-50 border-violet-200',
  out_delivery: 'text-orange-700 bg-orange-50 border-orange-200',
  delivered: 'text-green-700 bg-green-50  border-green-200',
  cancelled: 'text-red-700   bg-red-50    border-red-200',
};

export function DashboardPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const wishlistCount = useAppSelector((state) => state.wishlist?.items?.length ?? 0);
  const { orders, isLoading, pagination } = useAppSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders({ status: 'all', page: 1, limit: 5 }));
  }, [dispatch]);

  const recentOrders = orders.slice(0, 3);

  const totalSpent = useMemo(
    () => orders.filter((o) => o.status === 'delivered').reduce((sum, o) => sum + (o.totalAmount ?? 0), 0),
    [orders],
  );

  const inTransit = useMemo(
    () => orders.filter((o) => o.status === 'shipped' || o.status === 'processing').length,
    [orders],
  );

  const trackingSteps = [
    { label: t('user_dashboard.tracking_placed'), done: true, icon: RiShoppingBagLine },
    { label: t('user_dashboard.tracking_confirmed'), done: true, icon: RiCheckboxCircleLine },
    { label: t('user_dashboard.tracking_shipped'), done: true, icon: RiTruckLine },
    { label: t('user_dashboard.tracking_out_delivery'), done: false, icon: RiMapPinLine },
    { label: t('user_dashboard.tracking_delivered'), done: false, icon: RiCheckboxCircleLine },
  ];

  const statCards = [
    { label: t('user_dashboard.stat_orders'), value: String(pagination.total || orders.length), sub: t('user_dashboard.stat_orders_sub'), icon: RiShoppingBagLine },
    { label: t('user_dashboard.stat_spent'), value: `₹${totalSpent.toLocaleString('en-IN')}`, sub: t('user_dashboard.stat_spent_sub'), icon: RiArrowUpLine },
    { label: t('user_dashboard.stat_wishlist'), value: String(wishlistCount), sub: t('user_dashboard.stat_wishlist_sub'), icon: RiHeartLine },
    { label: t('user_dashboard.stat_transit'), value: String(inTransit), sub: t('user_dashboard.stat_transit_sub'), icon: RiTruckLine },
  ];

  const orderHeaders = [
    t('user_dashboard.col_product'),
    t('user_dashboard.col_qty'),
    t('user_dashboard.col_amount'),
    t('user_dashboard.col_status'),
  ];

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t('user_dashboard.welcome')}, {user?.name ?? 'Customer'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t('user_dashboard.account_summary')}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <s.icon size={18} className="text-slate-400 dark:text-slate-500" />
              <span className="text-[10px] font-medium text-slate-400">{s.sub}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders + Mini Tracker */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Orders Table */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('user_dashboard.recent_orders')}</h3>
            <Link
              to="/orders"
              className="flex items-center gap-0.5 text-xs font-medium text-green-700 dark:text-green-400"
            >
              {t('common.view_all')} <RiArrowRightSLine size={14} />
            </Link>
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {orderHeaders.map((h) => (
                    <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                {isLoading ? (
                  <>
                    <TableRowSkeleton columns={4} />
                    <TableRowSkeleton columns={4} />
                  </>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-400">
                      No orders yet.{' '}
                      <Link to="/products" className="text-green-700 dark:text-green-400 underline">
                        Browse products
                      </Link>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((o) => {
                    const item = o.items?.[0];
                    return (
                      <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="px-5 py-3">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-35">
                            {item?.name ?? o.productName ?? 'Product'}
                          </p>
                          <p className="text-[10px] text-slate-400">#{o.id}</p>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300">
                          {item?.quantity ?? o.quantity ?? 1}
                        </td>
                        <td className="px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white">
                          ₹{(o.totalAmount ?? 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-semibold capitalize ${statusColors[o.status] ?? ''}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {isLoading && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-gray-900">
                <RiLoader4Line className="animate-spin text-green-600" size={20} />
              </div>
            )}

            {!isLoading && recentOrders.length === 0 && (
              <EmptyState
                icon={<RiInboxUnarchiveLine size={22} />}
                title="No orders yet"
                message="Browse products to place your first order."
                actionLabel="Browse products"
                onAction={() => (window.location.href = '/products')}
              />
            )}

            {!isLoading && recentOrders.map((o) => {
              const item = o.items?.[0];
              return (
                <div key={o.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-gray-900">
                  <p className="text-xs text-slate-400">#{o.id}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {item?.name ?? o.productName ?? 'Product'}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                    <span>Qty: {item?.quantity ?? o.quantity ?? 1}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">₹{(o.totalAmount ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Timeline */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('user_dashboard.live_tracking')}</h3>
            {orders.find((o) => o.status === 'shipped' || o.status === 'processing') && (
              <Link
                to={`/orders/${orders.find((o) => o.status === 'shipped' || o.status === 'processing')?.id}/track`}
                className="text-xs font-medium text-green-700 dark:text-green-400 flex items-center gap-0.5"
              >
                {t('common.full_view')} <RiArrowRightSLine size={14} />
              </Link>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mb-5">
            {orders.find((o) => o.status === 'shipped' || o.status === 'processing')
              ? `#${orders.find((o) => o.status === 'shipped' || o.status === 'processing')?.id} · ${orders.find((o) => o.status === 'shipped' || o.status === 'processing')?.items?.[0]?.name ?? 'Order'}`
              : 'No active shipments'}
          </p>

          <div className="space-y-1">
            {trackingSteps.map((step, i) => {
              const Icon = step.icon;
              const isActive = !step.done && trackingSteps[i - 1]?.done;
              return (
                <div key={step.label} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${step.done
                      ? 'bg-green-600 border-green-600 text-white'
                      : isActive
                        ? 'border-yellow-500 text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 bg-white dark:bg-gray-900'
                      }`}
                  >
                    <Icon size={11} />
                  </div>
                  <span
                    className={`text-xs ${step.done || isActive
                      ? 'text-slate-700 dark:text-slate-200 font-medium'
                      : 'text-slate-400 dark:text-slate-600'
                      }`}
                  >
                    {step.label}
                  </span>
                  {isActive && (
                    <span className="ml-auto text-[9px] font-bold uppercase text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 px-1.5 py-0.5 rounded">
                      {t('common.now')}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Spending Chart */}
      <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-5">{t('user_dashboard.monthly_spend')}</h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spendData}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={(v: number) => `₹${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '11px' }}
                formatter={(v: number | string) => [`₹${v}`, t('user_dashboard.stat_spent')]}
              />
              <Line type="monotone" dataKey="amount" stroke="#16a34a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
