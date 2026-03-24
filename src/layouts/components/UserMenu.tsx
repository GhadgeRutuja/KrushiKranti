import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    RiLogoutBoxLine,
    RiDashboardLine,
    RiUserLine,
    RiArrowDownSLine,
} from 'react-icons/ri';
import { useAppDispatch, useAppSelector } from '../../shared/hooks';
import { logout } from '../../modules/auth/authSlice';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

/** Returns a deterministic hue from a string so each user gets a unique tint */
function nameToHue(name: string): number {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash) % 360;
}

export function UserMenu() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await dispatch(logout());
        toast.success(t('common.logout_success') || 'Logged out successfully');
        navigate('/');
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getDashboardLink = () => {
        switch (user?.role) {
            case 'admin': return '/admin/dashboard';
            case 'farmer': return '/farmer/dashboard';
            case 'wholesaler': return '/wholesaler/dashboard';
            default: return '/dashboard';
        }
    };

    const initial = user?.name?.charAt(0)?.toUpperCase() ?? '?';
    const hue = nameToHue(user?.name ?? 'User');
    const avatarBg = `hsl(${hue},55%,48%)`;
    const avatarBg2 = `hsl(${hue},65%,38%)`;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* ── Trigger button ── */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 rounded-full pl-0.5 pr-2 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
                {/* Circular avatar */}
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-slate-900 shadow-sm shrink-0 select-none"
                    style={{ background: `linear-gradient(135deg, ${avatarBg}, ${avatarBg2})` }}
                >
                    {initial}
                </div>

                {/* Name (hidden on very small screens) */}
                <span className="hidden sm:block text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[80px] truncate">
                    {user?.name?.split(' ')[0]}
                </span>

                <RiArrowDownSLine
                    size={15}
                    className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* ── Dropdown ── */}
            {isOpen && (
                <div className="absolute right-0 mt-2.5 w-52 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-[100]">
                    {/* Header */}
                    <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
                        <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold ring-2 ring-white dark:ring-slate-900 shadow shrink-0"
                            style={{ background: `linear-gradient(135deg, ${avatarBg}, ${avatarBg2})` }}
                        >
                            {initial}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate capitalize">{user?.role}</p>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="py-1">
                        <Link
                            to={getDashboardLink()}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <RiDashboardLine size={14} />
                            {t('nav.control_panel')}
                        </Link>
                        <Link
                            to="/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <RiUserLine size={14} />
                            {t('nav.public_profile')}
                        </Link>
                    </div>

                    {/* Logout */}
                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 font-medium hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors"
                        >
                            <RiLogoutBoxLine size={14} />
                            {t('nav.sign_out')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
