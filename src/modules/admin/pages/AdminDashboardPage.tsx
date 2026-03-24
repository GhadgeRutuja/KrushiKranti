import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  RiArrowRightSLine,
  RiArrowUpLine,
  RiUserLine,
  RiPlantLine,
  RiShoppingBagLine,
  RiShieldLine,
  RiPercentLine,
  RiCheckboxCircleLine,
  RiCloseLine,
  RiTimeLine,
  RiMoneyDollarCircleLine,
  RiInboxUnarchiveLine,
} from 'react-icons/ri';
import { useTranslation } from 'react-i18next';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import api from '../../../services/api';
import { adminService } from '../adminService';
import { orderService } from '../../orders/orderService';
import { productService } from '../../product/productService';
import type { AdminUser } from '../types';
import { ErrorState, Skeleton, TableRowSkeleton } from '../../../shared/components/ui';

const revenueData = [
  { month: 'Oct', revenue: 85000 },
  { month: 'Nov', revenue: 92000 },
  { month: 'Dec', revenue: 110000 },
  { month: 'Jan', revenue: 135000 },
  { month: 'Feb', revenue: 158000 },
  { month: 'Mar', revenue: 182000 },
];

const userGrowthData = [
  { month: 'Oct', users: 150, farmers: 45 },
  { month: 'Nov', users: 180, farmers: 52 },
  { month: 'Dec', users: 220, farmers: 58 },
  { month: 'Jan', users: 280, farmers: 65 },
  { month: 'Feb', users: 350, farmers: 78 },
  { month: 'Mar', users: 420, farmers: 92 },
];

const ROLE_BADGE: Record<string, string> = {
  user: 'text-blue-700 bg-blue-50 border-blue-200',
  farmer: 'text-green-700 bg-green-50 border-green-200',
  wholesaler: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  admin: 'text-purple-700 bg-purple-50 border-purple-200',
  ROLE_USER: 'text-blue-700 bg-blue-50 border-blue-200',
  ROLE_FARMER: 'text-green-700 bg-green-50 border-green-200',
  ROLE_WHOLESALER: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  ROLE_ADMIN: 'text-purple-700 bg-purple-50 border-purple-200',
};

function nameToHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}

function formatRole(role: string): string {
  return role.replace('ROLE_', '').toLowerCase();
}

interface DashStats {
  totalUsers: number;
  totalFarmers: number;
  totalWholesalers: number;
  totalOrders: number;
  totalRevenue: number;
  activeNegotiations: number;
}

export function AdminDashboardPage() {
  const { t } = useTranslation();
  const [dashStats, setDashStats] = useState<DashStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [orderStats, setOrderStats] = useState<{ totalOrders: number; totalRevenue: number; totalCommission: number } | null>(null);
  const [pendingProducts, setPendingProducts] = useState<{ name: string; farmer: string; category: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setLoadError(null);

      const [statsRes, usersRes, orderRes, productRes] = await Promise.allSettled([
        api.get<{ data: DashStats }>('/admin/dashboard/stats'),
        adminService.getAllUsers(0, 5),
        orderService.getAdminStats(),
        productService.getProducts({}, 1, 5),
      ]);

      if (statsRes.status === 'fulfilled') {
        setDashStats(statsRes.value.data.data);
      }

      if (usersRes.status === 'fulfilled') {
        setRecentUsers(usersRes.value.users);
      }

      if (orderRes.status === 'fulfilled') {
        setOrderStats(orderRes.value);
      }

      if (productRes.status === 'fulfilled') {
        setPendingProducts(
          productRes.value.data.slice(0, 3).map((p: any) => ({
            name: p.name,
            farmer: p.farmerName ?? 'Unknown',
            category: p.category ?? 'General',
          })),
        );
      }

      if (
        statsRes.status === 'rejected' &&
        usersRes.status === 'rejected' &&
        orderRes.status === 'rejected' &&
        productRes.status === 'rejected'
      ) {
        setLoadError('Failed to load dashboard data. Please try again.');
      }

      setIsLoading(false);
    };

    loadDashboard();
  }, []);

  const statCards = [
    { label: t('admin.stat_revenue'), value: dashStats ? `₹${(dashStats.totalRevenue / 100000).toFixed(1)}L` : '—', sub: t('admin.stat_revenue_sub'), icon: RiMoneyDollarCircleLine, iconBg: 'bg-green-50 dark:bg-green-900/20', iconColor: 'text-green-600' },
    { label: t('admin.stat_users'), value: dashStats ? dashStats.totalUsers.toLocaleString() : '—', sub: t('admin.stat_users_sub'), icon: RiUserLine, iconBg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600' },
    { label: t('admin.stat_products'), value: dashStats ? dashStats.totalFarmers.toLocaleString() : '—', sub: t('admin.stat_products_sub'), icon: RiPlantLine, iconBg: 'bg-yellow-50 dark:bg-yellow-900/20', iconColor: 'text-yellow-600' },
    { label: t('admin.stat_orders'), value: dashStats ? dashStats.totalOrders.toLocaleString() : '—', sub: t('admin.stat_orders_sub'), icon: RiShoppingBagLine, iconBg: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-600' },
  ];

  const commissions = [
    { category: 'Consumer Orders', rate: '2%', earned: orderStats ? `₹${Math.round(orderStats.totalCommission * 0.3).toLocaleString()}` : '—' },
    { category: 'Wholesale / Agent', rate: '5%', earned: orderStats ? `₹${Math.round(orderStats.totalCommission * 0.5).toLocaleString()}` : '—' },
    { category: 'Farmer Platform Fee', rate: '3%', earned: orderStats ? `₹${Math.round(orderStats.totalCommission * 0.2).toLocaleString()}` : '—' },
  ];

  const userHeaders = [
    t('admin.col_name'), t('admin.col_role'), t('admin.col_joined'),
    t('admin.col_status'), t('admin.col_action'),
  ];

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('admin.platform_overview')}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t('admin.platform_overview_desc')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="mt-4 h-8 w-20" />
                <Skeleton className="mt-2 h-4 w-28" />
              </div>
            ))
          : statCards.map((s) => (
              <div key={s.label} className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.iconBg}`}>
                    <s.icon size={20} className={s.iconColor} />
                  </div>
                  <span className="text-[10px] font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <RiArrowUpLine size={10} />{s.sub}
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">{s.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
      </div>

      {loadError && (
        <ErrorState message={loadError} onRetry={() => window.location.reload()} />
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-5">{t('admin.chart_revenue')}</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height={192}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={(v: number) => `₹${v / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '11px' }} formatter={(v: number | string) => [`₹${v}`, t('admin.stat_revenue')]} />
                <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('admin.chart_user_growth')}</h3>
            <div className="flex items-center gap-3">
              {[{ label: t('admin.legend_users'), color: 'bg-blue-500' }, { label: t('admin.legend_farmers'), color: 'bg-green-600' }].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
                  <span className="text-[10px] text-slate-400 font-medium">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height={192}>
              <BarChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '11px' }} />
                <Bar dataKey="users" fill="#3b82f6" radius={[2, 2, 0, 0]} name={t('admin.legend_users')} />
                <Bar dataKey="farmers" fill="#16a34a" radius={[2, 2, 0, 0]} name={t('admin.legend_farmers')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Fraud Alerts */}
      <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <RiShieldLine size={16} className="text-red-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('admin.fraud_alerts')}</h3>
          </div>
          <Link to="/admin/fraud" className="flex items-center gap-0.5 text-xs font-medium text-red-600 dark:text-red-400">
            {t('common.view_all')} <RiArrowRightSLine size={14} />
          </Link>
        </div>
        <div className="px-5 py-8 text-center text-sm text-slate-400">
          No active fraud alerts. Visit the <Link to="/admin/fraud" className="text-red-600 font-medium">Fraud Detection</Link> page for details.
        </div>
      </div>

      {/* 3-col row: Pending Approvals + Commissions + Activity Logs */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Pending Approvals */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <RiTimeLine size={14} className="text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('admin.pending_approvals')}</h3>
            </div>
            <Link to="/admin/products" className="flex items-center gap-0.5 text-xs font-medium text-yellow-700 dark:text-yellow-400">
              {t('common.all')} <RiArrowRightSLine size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800/60">
            {pendingProducts.map((p) => (
              <div key={p.name} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-400">{p.farmer} · {p.category}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button className="w-6 h-6 bg-green-50 dark:bg-green-900/20 text-green-600 border border-green-200 dark:border-green-800 rounded flex items-center justify-center">
                    <RiCheckboxCircleLine size={12} />
                  </button>
                  <button className="w-6 h-6 bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-800 rounded flex items-center justify-center">
                    <RiCloseLine size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commission Tracking */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <RiPercentLine size={14} className="text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('admin.commission_report')}</h3>
            </div>
            <Link to="/admin/commissions" className="flex items-center gap-0.5 text-xs font-medium text-green-700 dark:text-green-400">
              {t('common.details')} <RiArrowRightSLine size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800/60">
            {commissions.map((c) => (
              <div key={c.category} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{c.category}</p>
                  <p className="text-[10px] text-slate-400">{t('common.rate_label')}: {c.rate}</p>
                </div>
                <span className="text-sm font-bold text-green-700 dark:text-green-400 tabular-nums">{c.earned}</span>
              </div>
            ))}
            <div className="px-5 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
              <p className="text-xs font-bold text-slate-700 dark:text-white uppercase tracking-wide">{t('admin.commission_total')}</p>
              <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">₹{orderStats ? orderStats.totalCommission.toLocaleString() : '—'}</span>
            </div>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('admin.activity_logs')}</h3>
            <Link to="/admin/logs" className="flex items-center gap-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              {t('common.all')} <RiArrowRightSLine size={14} />
            </Link>
          </div>
          <div className="px-5 py-8 text-center text-sm text-slate-400">
            Visit the <Link to="/admin/logs" className="text-blue-600 font-medium">Activity Logs</Link> page for full history.
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <RiUserLine size={16} className="text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('admin.recent_users')}</h3>
          </div>
          <Link to="/admin/users" className="flex items-center gap-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
            {t('common.manage_all')} <RiArrowRightSLine size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {userHeaders.map((h) => (
                  <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-slate-900 shadow-sm shrink-0"
                        style={{ background: `linear-gradient(135deg, hsl(${nameToHue(u.name)},55%,50%), hsl(${nameToHue(u.name)},65%,38%))` }}
                      >
                        {u.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-semibold capitalize ${ROLE_BADGE[u.role] ?? 'text-gray-700 bg-gray-50 border-gray-200'}`}>
                      {formatRole(u.role)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-500 dark:text-slate-400">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-semibold ${u.status === 'active'
                      ? 'text-green-700 bg-green-50 border-green-200'
                      : 'text-red-700 bg-red-50 border-red-200'
                      }`}>
                      {u.status === 'active' ? t('admin.status_active') : t('admin.status_banned')}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Link to="/admin/users" className={`text-xs font-medium border px-2 py-1 rounded ${u.status === 'active'
                      ? 'text-red-600 border-red-200 dark:border-red-800'
                      : 'text-green-600 border-green-200 dark:border-green-800'
                      }`}>
                      {u.status === 'active' ? t('common.ban') : t('common.unban')}
                    </Link>
                  </td>
                </tr>
              ))}
              {isLoading && (
                <>
                  <TableRowSkeleton columns={5} />
                  <TableRowSkeleton columns={5} />
                  <TableRowSkeleton columns={5} />
                </>
              )}

              {!isLoading && recentUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RiInboxUnarchiveLine size={16} /> No users found
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
