import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks';
import { fetchFarmerStats } from '../farmerSlice';
import {
    RiMoneyDollarCircleLine,
    RiCalendarLine,
    RiShoppingBagLine,
    RiBarChartBoxLine,
    RiArrowUpLine,
    RiArrowDownLine,
} from 'react-icons/ri';
import {
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Area, AreaChart,
} from 'recharts';

/* ── Mock earnings data ──────────────────────────────────── */
const monthlyRevenue = [
    { month: 'Apr', revenue: 18500, orders: 24 },
    { month: 'May', revenue: 22000, orders: 31 },
    { month: 'Jun', revenue: 19800, orders: 27 },
    { month: 'Jul', revenue: 28500, orders: 38 },
    { month: 'Aug', revenue: 32000, orders: 44 },
    { month: 'Sep', revenue: 27500, orders: 36 },
    { month: 'Oct', revenue: 35000, orders: 47 },
    { month: 'Nov', revenue: 38000, orders: 52 },
    { month: 'Dec', revenue: 42000, orders: 58 },
    { month: 'Jan', revenue: 45000, orders: 63 },
    { month: 'Feb', revenue: 49500, orders: 68 },
    { month: 'Mar', revenue: 52000, orders: 71 },
];

const weeklyData = [
    { day: 'Mon', sale: 4200 },
    { day: 'Tue', sale: 6800 },
    { day: 'Wed', sale: 5100 },
    { day: 'Thu', sale: 7600 },
    { day: 'Fri', sale: 9200 },
    { day: 'Sat', sale: 11500 },
    { day: 'Sun', sale: 8300 },
];

const recentEarnings = [
    { product: 'Organic Tomatoes', qty: '15 kg', price: 900, date: '05 Mar 2026', status: 'paid' },
    { product: 'Fresh Spinach', qty: '8 kg', price: 320, date: '04 Mar 2026', status: 'paid' },
    { product: 'Basmati Rice', qty: '30 kg', price: 3600, date: '03 Mar 2026', status: 'pending' },
    { product: 'Green Chillies', qty: '5 kg', price: 150, date: '02 Mar 2026', status: 'paid' },
    { product: 'Fresh Carrots', qty: '10 kg', price: 280, date: '01 Mar 2026', status: 'paid' },
    { product: 'Organic Potatoes', qty: '25 kg', price: 500, date: '28 Feb 2026', status: 'pending' },
    { product: 'Coriander Leaves', qty: '4 kg', price: 200, date: '27 Feb 2026', status: 'failed' },
];

const STATUS_STYLE: Record<string, string> = {
    paid: 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800',
    pending: 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800',
    failed: 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800',
};

/* ── Shared card wrapper ─────────────────────────────────── */
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-xl ${className}`}>
            {children}
        </div>
    );
}

/* ── Stat card ───────────────────────────────────────────── */
interface StatProps {
    label: string;
    value: string;
    trend: string;
    up: boolean;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
}
function StatCard({ label, value, trend, up, icon: Icon, iconColor, iconBg }: StatProps) {
    return (
        <Card className="p-5">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
                    <Icon size={20} className={iconColor} />
                </div>
                <span
                    className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${up
                            ? 'text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/20'
                            : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
                        }`}
                >
                    {up ? <RiArrowUpLine size={12} /> : <RiArrowDownLine size={12} />}
                    {trend}
                </span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
        </Card>
    );
}

/* ── Main Page ───────────────────────────────────────────── */
export function FarmerEarningsPage() {
    const dispatch = useAppDispatch();
    const { stats, isLoading } = useAppSelector((state) => state.farmer);

    useEffect(() => {
        dispatch(fetchFarmerStats());
    }, [dispatch]);

    const totalRevenue = stats.totalRevenue || 368590;
    const monthlyEarning = monthlyRevenue[monthlyRevenue.length - 1].revenue;
    const totalOrders = stats.totalOrders || 156;
    const avgOrderValue = Math.round(totalRevenue / (totalOrders || 1));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ── Page heading ── */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Earnings & Revenue</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Track your income, sales trends, and payment history.
                </p>
            </div>

            {/* ── Summary stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Revenue"
                    value={`₹${totalRevenue.toLocaleString('en-IN')}`}
                    trend="+12.4%"
                    up
                    icon={RiMoneyDollarCircleLine}
                    iconColor="text-green-600"
                    iconBg="bg-green-50 dark:bg-green-900/20"
                />
                <StatCard
                    label="This Month"
                    value={`₹${monthlyEarning.toLocaleString('en-IN')}`}
                    trend="+8.1%"
                    up
                    icon={RiCalendarLine}
                    iconColor="text-blue-600"
                    iconBg="bg-blue-50 dark:bg-blue-900/20"
                />
                <StatCard
                    label="Total Orders"
                    value={String(totalOrders)}
                    trend="+5.3%"
                    up
                    icon={RiShoppingBagLine}
                    iconColor="text-yellow-600"
                    iconBg="bg-yellow-50 dark:bg-yellow-900/20"
                />
                <StatCard
                    label="Avg. Order Value"
                    value={`₹${avgOrderValue.toLocaleString('en-IN')}`}
                    trend="-2.1%"
                    up={false}
                    icon={RiBarChartBoxLine}
                    iconColor="text-purple-600"
                    iconBg="bg-purple-50 dark:bg-purple-900/20"
                />
            </div>

            {/* ── Charts row ── */}
            <div className="grid lg:grid-cols-5 gap-4">
                {/* Monthly revenue area chart — wider */}
                <Card className="lg:col-span-3 p-5">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Revenue</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Last 12 months</p>
                        </div>
                        <span className="text-xs font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                            ₹{monthlyEarning.toLocaleString('en-IN')} this month
                        </span>
                    </div>
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyRevenue}>
                                <defs>
                                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#16a34a" stopOpacity={0.15} />
                                        <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                                    tickFormatter={(v: number) => `₹${v / 1000}k`}
                                    width={42}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    }}
                                    formatter={(v: number | string | undefined) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#16a34a"
                                    strokeWidth={2.5}
                                    fill="url(#revenueGrad)"
                                    dot={false}
                                    activeDot={{ r: 4, fill: '#16a34a', stroke: '#fff', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Weekly sales bar chart */}
                <Card className="lg:col-span-2 p-5">
                    <div className="mb-5">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Weekly Sales</h3>
                        <p className="text-xs text-slate-400 mt-0.5">This week's daily breakdown</p>
                    </div>
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData} barSize={20}>
                                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                                    tickFormatter={(v: number) => `₹${v / 1000}k`}
                                    width={38}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    }}
                                    formatter={(v: number | string | undefined) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Sales']}
                                />
                                <Bar dataKey="sale" fill="#eab308" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* ── Recent Earnings Table ── */}
            <Card>
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Earnings</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Your latest product sales and payment status</p>
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                        {recentEarnings.length} transactions
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                {['Product', 'Quantity', 'Amount', 'Date', 'Status'].map((h) => (
                                    <th
                                        key={h}
                                        className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                            {recentEarnings.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{row.product}</p>
                                    </td>
                                    <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">{row.qty}</td>
                                    <td className="px-5 py-3.5 text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                                        ₹{row.price.toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">{row.date}</td>
                                    <td className="px-5 py-3.5">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-bold capitalize ${STATUS_STYLE[row.status]}`}
                                        >
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Table footer */}
                <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                        Total earned:{' '}
                        <span className="font-bold text-green-700 dark:text-green-400">
                            ₹{recentEarnings
                                .filter((r) => r.status === 'paid')
                                .reduce((s, r) => s + r.price, 0)
                                .toLocaleString('en-IN')}
                        </span>{' '}
                        this period
                    </span>
                    <button className="text-xs font-semibold text-green-700 dark:text-green-400 hover:underline underline-offset-2">
                        Download CSV →
                    </button>
                </div>
            </Card>
        </div>
    );
}
