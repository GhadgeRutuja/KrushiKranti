import {
    RiDashboardLine,
    RiFileListLine,
    RiStoreLine,
    RiMessage2Line,
    RiUserLine,
    RiStarLine,
} from 'react-icons/ri';
import { useTranslation } from 'react-i18next';
import { BaseDashboardLayout } from './BaseDashboardLayout';

export function WholesalerLayout() {
    const { t } = useTranslation();

    const menuItems = [
        { to: '/wholesaler/dashboard', label: t('wholesaler.nav.dashboard'), icon: RiDashboardLine },
        { to: '/wholesaler/bulk-market', label: 'Bulk Market', icon: RiStoreLine },
        { to: '/wholesaler/bulk-requests', label: t('wholesaler.nav.bulk_requests'), icon: RiFileListLine },
        { to: '/wholesaler/inventory', label: t('wholesaler.nav.inventory'), icon: RiStoreLine },
        { to: '/wholesaler/negotiations', label: 'Negotiations', icon: RiMessage2Line },
        // { to: '/wholesaler/chat', label: t('wholesaler.nav.chat'), icon: RiMessage2Line },
        { to: '/wholesaler/ratings', label: t('wholesaler.nav.supplier_ratings'), icon: RiStarLine },
        { to: '/wholesaler/profile', label: t('wholesaler.nav.profile'), icon: RiUserLine },
    ];

    return (
        <BaseDashboardLayout
            menuItems={menuItems}
            title={t('wholesaler.portal')}
            roleLabel={t('wholesaler.role_label')}
        />
    );
}
