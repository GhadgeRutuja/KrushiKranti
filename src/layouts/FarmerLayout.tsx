import {
    RiDashboardLine,
    RiPlantLine,
    RiAddCircleLine,
    RiShoppingBagLine,
    RiBarChartLine,
    RiMessage2Line,
    RiUserLine,
    RiCalendarLine,
} from 'react-icons/ri';
import { useTranslation } from 'react-i18next';
import { BaseDashboardLayout } from './BaseDashboardLayout';

export function FarmerLayout() {
    const { t } = useTranslation();

    const menuItems = [
        { to: '/farmer/dashboard', label: t('farmer.nav.dashboard'), icon: RiDashboardLine },
        { to: '/farmer/products', label: t('farmer.nav.my_products'), icon: RiPlantLine },
        { to: '/farmer/products/add', label: t('farmer.nav.add_product'), icon: RiAddCircleLine },
        { to: '/farmer/bulk-products', label: 'Bulk Products', icon: RiPlantLine },
        { to: '/farmer/orders', label: t('farmer.nav.orders'), icon: RiShoppingBagLine },
        { to: '/farmer/earnings', label: t('farmer.nav.revenue'), icon: RiBarChartLine },
        { to: '/farmer/events', label: 'Events', icon: RiCalendarLine },
        { to: '/farmer/negotiations', label: 'Negotiations', icon: RiMessage2Line },
        // { to: '/farmer/chat', label: t('farmer.nav.chat'), icon: RiMessage2Line },
        { to: '/farmer/profile', label: t('farmer.nav.profile'), icon: RiUserLine },
    ];

    return (
        <BaseDashboardLayout
            menuItems={menuItems}
            title={t('layout.farmer_portal')}
            roleLabel={t('layout.farmer_role')}
        />
    );
}
