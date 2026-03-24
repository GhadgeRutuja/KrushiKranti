import {
  RiDashboardLine,
  RiTruckLine,
  RiUserLine,
} from "react-icons/ri";
import { BaseDashboardLayout } from "./BaseDashboardLayout";

export function DeliveryLayout() {
  const menuItems = [
    {
      to: "/delivery/dashboard",
      label: "My Deliveries",
      icon: RiTruckLine,
    },
    {
      to: "/delivery/orders",
      label: "All Orders",
      icon: RiDashboardLine,
    },
    {
      to: "/delivery/profile",
      label: "Profile",
      icon: RiUserLine,
    },
  ];

  return (
    <BaseDashboardLayout
      menuItems={menuItems}
      title="Delivery Dashboard"
      roleLabel="Delivery Partner"
    />
  );
}
