import {
  RiMailLine,
  RiDashboardLine,
  RiUserLine,
  RiPlantLine,
  RiShieldLine,
  RiPercentLine,
  RiFileTextLine,
  RiMessage2Line,
  RiShoppingBagLine,
  RiArticleLine,
  RiBankCardLine,
  RiTruckLine,
  RiUserAddLine,
  RiFileListLine,
  RiImageAddLine,
  RiCalendarLine,
} from "react-icons/ri";
import { FiUser } from "react-icons/fi";
import { useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { BaseDashboardLayout } from "./BaseDashboardLayout";
import { useAppDispatch, useAppSelector } from '../shared/hooks';
import { fetchAdminUnreadContactCount } from '../modules/admin/contactMessagesSlice';

export function AdminLayout() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const unreadContactCount = useAppSelector((state) => state.adminContactMessages.unreadCount);

  useEffect(() => {
    dispatch(fetchAdminUnreadContactCount());

    const intervalId = window.setInterval(() => {
      dispatch(fetchAdminUnreadContactCount());
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [dispatch]);

  const menuItems = [
    {
      to: "/admin/dashboard",
      label: t("admin.nav.overview"),
      icon: RiDashboardLine,
    },
    { to: "/admin/orders", label: t("admin.nav.orders"), icon: RiShoppingBagLine },
    { to: "/admin/users", label: t("admin.nav.users"), icon: RiUserLine },
    {
      to: "/admin/products",
      label: t("admin.nav.products"),
      icon: RiPlantLine,
    },
    { to: "/admin/delivery-boys", label: t("admin.nav.delivery_boys"), icon: RiUserAddLine },
    { to: "/admin/order-assignment", label: t("admin.nav.order_assignment"), icon: RiFileListLine },
    { to: "/admin/blogs", label: t("admin.nav.blogs"), icon: RiArticleLine },
    {
      to: "/admin/contact-messages",
      label: t('admin.nav.contact_messages', 'Contact Messages'),
      icon: RiMailLine,
      badgeCount: unreadContactCount,
    },
    { to: "/admin/payments", label: t("admin.nav.payments"), icon: RiBankCardLine },
    { to: "/admin/shipments", label: t("admin.nav.shipments"), icon: RiTruckLine },
    { to: "/admin/fraud", label: t("admin.nav.fraud"), icon: RiShieldLine },
    { to: "/admin/banners", label: t("admin.nav.banners"), icon: RiImageAddLine },
    { to: "/admin/events", label: t("admin.nav.events", "Events"), icon: RiCalendarLine },
    {
      to: "/admin/commissions",
      label: t("admin.nav.commissions"),
      icon: RiPercentLine,
    },
    { to: "/admin/logs", label: t("admin.nav.logs"), icon: RiFileTextLine },
    { to: "/admin/negotiations", label: t("admin.nav.negotiations"), icon: RiMessage2Line },
    { to: "/admin/chat", label: t("admin.nav.chat"), icon: RiMessage2Line },
    { to: "/admin/profile", label: t("admin.nav.profile"), icon: FiUser },
  ];

  return (
    <BaseDashboardLayout
      menuItems={menuItems}
      title={t("layout.admin_console")}
      roleLabel={t("layout.admin_role")}
    />
  );
}
