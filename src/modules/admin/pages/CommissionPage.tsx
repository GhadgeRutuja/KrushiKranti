import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IndianRupee, TrendingUp, Percent, Loader, Info } from 'lucide-react';
import { orderService } from '../../orders/orderService';
import type { Order } from '../../orders/types';
import { useTranslation } from 'react-i18next';

// Interface for admin stats
interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  totalCommission: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
}

// Demo monthly chart data — no backend time-series API yet
const monthlyCommissions = [
  { month: 'Jan', commission: 42500, orders: 850 },
  { month: 'Feb', commission: 46000, orders: 920 },
  { month: 'Mar', commission: 55000, orders: 1100 },
  { month: 'Apr', commission: 67500, orders: 1350 },
  { month: 'May', commission: 79000, orders: 1580 },
  { month: 'Jun', commission: 91000, orders: 1820 },
];

export function CommissionPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [statsData, ordersData] = await Promise.all([
          orderService.getAdminStats(),
          orderService.getAllOrders(1, 10),
        ]);
        setStats(statsData);
        setRecentOrders(ordersData.data);
      } catch (err) {
        setError((err as Error).message);
        console.error('Failed to load commission data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Use real data if available, else fall back to defaults
  const totalEarnings = stats?.totalCommission ?? 0;
  const totalOrders = stats?.totalOrders ?? 0;
  const avgCommission = totalOrders > 0 ? Math.round(totalEarnings / totalOrders) : 0;
  const totalRevenue = stats?.totalRevenue ?? 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <Loader className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <p className="text-red-500 mb-2">{t('adminPages.commission.failed_load')}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('adminPages.commission.title')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('adminPages.commission.subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-600 text-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <IndianRupee size={20} />
            </div>
            <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">10% Rate</span>
          </div>
          <p className="text-green-100 text-xs uppercase font-medium">{t('adminPages.commission.platform_commission')}</p>
          <p className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <IndianRupee className="text-blue-600" size={20} />
            </div>
            <span className="text-xs font-medium text-blue-600">Total</span>
          </div>
          <p className="text-gray-500 text-xs uppercase font-medium">{t('adminPages.commission.total_revenue')}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Percent className="text-yellow-600" size={20} />
            </div>
            <span className="text-xs font-medium text-green-600">10% Rate</span>
          </div>
          <p className="text-gray-500 text-xs uppercase font-medium">{t('adminPages.commission.avg_commission_order')}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{avgCommission}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <span className="text-xs font-medium text-green-600">+12%</span>
          </div>
          <p className="text-gray-500 text-xs uppercase font-medium">{t('adminPages.commission.total_orders')}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalOrders.toLocaleString()}</p>
        </div>
      </div>

      {/* Monthly Breakdown Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('adminPages.commission.monthly_breakdown')}</h3>
          <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            <Info size={12} /> {t('adminPages.commission.demo_chart')}
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyCommissions}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v: number) => `₹${v/1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="commission" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Commission Per Order Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('adminPages.commission.per_order')}</h3>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">{t('adminPages.commission.no_orders')}</div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-green-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase">{t('adminPages.commission.order_id')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase">{t('adminPages.commission.farmer')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-green-800 uppercase">{t('adminPages.commission.date')}</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-green-800 uppercase">{t('adminPages.commission.order_amount')}</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-green-800 uppercase">{t('adminPages.commission.commission_rate')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">#{order.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{order.farmerName || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">₹{(order.totalPrice ?? order.totalAmount ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600 text-right">₹{(order.adminCommission ?? Math.round((order.totalPrice ?? order.totalAmount ?? 0) * 0.1)).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {recentOrders.map(order => (
                <div key={order.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-600">#{order.id}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{order.farmerName || '-'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('adminPages.commission.order')}: ₹{(order.totalPrice ?? order.totalAmount ?? 0).toLocaleString()}</span>
                    <span className="text-sm font-semibold text-green-600">{t('adminPages.commission.commission')}: ₹{(order.adminCommission ?? Math.round((order.totalPrice ?? order.totalAmount ?? 0) * 0.1)).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
