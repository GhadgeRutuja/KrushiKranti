import {
    RiDashboardLine,
    RiShoppingBagLine,
    RiHeartLine,
    RiUserLine,
} from 'react-icons/ri';
import { useTranslation } from 'react-i18next';
import { BaseDashboardLayout } from './BaseDashboardLayout';

export function UserLayout() {
    const { t } = useTranslation();

    const menuItems = [
        { to: '/dashboard', label: t('user_dashboard.nav.dashboard'), icon: RiDashboardLine },
        { to: '/orders', label: t('user_dashboard.nav.orders'), icon: RiShoppingBagLine },
        { to: '/wishlist', label: t('user_dashboard.nav.wishlist'), icon: RiHeartLine },
        { to: '/profile', label: t('user_dashboard.nav.profile'), icon: RiUserLine },
    ];

    return (
        <BaseDashboardLayout
            menuItems={menuItems}
            title={t('layout.user_account')}
            roleLabel={t('layout.user_role')}
        />
    );
}
