import { Link, NavLink } from "react-router-dom";
import {
  RiMenuLine,
  RiCloseLine,
  RiShoppingCartLine,
  RiHeartLine,
  RiDashboardLine,
  RiShoppingBagLine,
  RiPlantLine,
  RiBarChartLine,
  RiFileListLine,
  RiShieldLine,
  RiUserLine,
} from "react-icons/ri";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../shared/hooks";
import { toggleDarkMode } from "../app/uiSlice";
import { fetchCartItemCount, resetCart } from "../modules/cart/cartSlice";
import { fetchUnreadCount } from "../modules/notifications/notificationSlice";
import { stompService } from "../services/stompService";
import { LanguageSwitcher } from "../shared/components/LanguageSwitcher";
import { ThemeToggle } from "../shared/components/ThemeToggle";
import { UserMenu } from "./components/UserMenu";
import { NotificationDropdown } from "./components/NotificationDropdown";
import type { Role } from "../modules/auth/types";

const WS_ENABLED = import.meta.env.VITE_WS_ENABLED === "true";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { darkMode } = useAppSelector((state) => state.ui);
  const { isAuthenticated, role, user } = useAppSelector((state) => state.auth);
  const currentRole: Role | null = role ?? user?.role ?? null;
  const { itemCount } = useAppSelector((state) => state.cart);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const wishlistCount = wishlistItems.length;
  const showWishlistBadge =
    isAuthenticated && currentRole === "user" && wishlistCount > 0;
  const showCartBadge =
    isAuthenticated && currentRole === "user" && itemCount > 0;

  useEffect(() => {
    if (isAuthenticated && currentRole === "user") {
      dispatch(fetchCartItemCount());
      return;
    }

    // Ensure stale cart badge data from a previous user session does not leak across roles.
    dispatch(resetCart());
  }, [isAuthenticated, currentRole, dispatch]);

  // Connect WebSocket and subscribe to notifications when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    const userId = String(user.id);
    dispatch(fetchUnreadCount());

    if (!WS_ENABLED) return;

    stompService
      .connect()
      .then(() => {
        stompService.subscribeToNotifications(userId);
      })
      .catch(() => {
        // Silently ignore WS connect failures
      });

    return () => {
      stompService.unsubscribeFromNotifications(userId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  const contactItems = [
    {
      icon: FiPhone,
      label: t("common.call_anytime"),
      value: "+91 98765 43210",
    },
    {
      icon: FiMail,
      label: t("common.send_email"),
      value: "support@krushikranti.com",
    },
    {
      icon: FiMapPin,
      label: t("common.location"),
      value: "India",
    },
  ];

  const navLinks = [
    { to: "/", label: t("common.home") },
    { to: "/products", label: t("common.products") },
    { to: "/blog", label: t("common.blog") },
    { to: "/about", label: t("common.about") },
    { to: "/contact", label: t("common.contact") },
  ];

  // Role-specific quick action links shown in navbar when authenticated
  const getRoleBasedLinks = () => {
    if (!isAuthenticated || !currentRole) return [];

    switch (currentRole) {
      case "user":
        return [
          {
            to: "/dashboard",
            label: t("nav.dashboard", "Dashboard"),
            icon: RiDashboardLine,
          },
          {
            to: "/orders",
            label: t("nav.orders", "Orders"),
            icon: RiShoppingBagLine,
          },
        ];
      case "farmer":
        return [
          {
            to: "/farmer/dashboard",
            label: t("nav.dashboard", "Dashboard"),
            icon: RiDashboardLine,
          },
          {
            to: "/farmer/products",
            label: t("nav.my_products", "My Products"),
            icon: RiPlantLine,
          },
          {
            to: "/farmer/earnings",
            label: t("nav.earnings", "Earnings"),
            icon: RiBarChartLine,
          },
        ];
      case "wholesaler":
        return [
          {
            to: "/wholesaler/dashboard",
            label: t("nav.dashboard", "Dashboard"),
            icon: RiDashboardLine,
          },
          {
            to: "/wholesaler/bulk-requests",
            label: t("nav.bulk_orders", "Bulk Orders"),
            icon: RiFileListLine,
          },
        ];
      case "admin":
        return [
          {
            to: "/admin/dashboard",
            label: t("nav.admin_panel", "Admin Panel"),
            icon: RiShieldLine,
          },
          {
            to: "/admin/users",
            label: t("nav.manage_users", "Users"),
            icon: RiUserLine,
          },
        ];
      default:
        return [];
    }
  };

  const roleBasedLinks = getRoleBasedLinks();

  return (
    <>
      {/* ══════════════ TOP HEADER (Contact Bar) ══════════════ */}
      <div className="bg-white dark:bg-gray-950 border-b border-slate-100 dark:border-slate-800 relative z-[90]">
        <div className="container-custom">
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <span className="text-2xl font-black tracking-tight leading-none">
                <span className="text-primary-600 dark:text-primary-400">
                  Krushi
                </span>
                <span className="text-accent-500">Kranti</span>
              </span>
            </Link>

            {/* Contact blocks */}
            <div className="hidden md:flex items-center gap-6 lg:gap-10">
              {contactItems.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-primary-100 dark:border-primary-900 flex items-center justify-center shrink-0">
                    <Icon
                      size={18}
                      className="text-primary-600 dark:text-primary-400"
                    />
                  </div>
                  <div className="leading-tight">
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {label}
                    </p>
                    <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ MAIN NAVIGATION BAR ══════════════ */}
      <nav className="bg-white dark:bg-gray-950 border-b border-slate-100 dark:border-slate-800 sticky top-0 shadow-sm transition-all duration-300 z-[100]">
        <div className="container-custom">
          <div className="flex items-center justify-between h-14">
            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) =>
                    `px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                      isActive
                        ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
                        : "text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {/* Role-based quick links */}
              {roleBasedLinks.length > 0 && (
                <>
                  <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
                  {roleBasedLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) =>
                        `px-3 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                          isActive
                            ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
                            : "text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`
                      }
                    >
                      <link.icon size={16} />
                      {link.label}
                    </NavLink>
                  ))}
                </>
              )}
            </div>

            {/* Right-side Actions */}
            <div className="flex items-center gap-1 ml-auto">
              {/* Language + Dark Mode — hidden on mobile */}
              <div className="hidden sm:flex items-center gap-1">
                <LanguageSwitcher />

                <ThemeToggle
                  isDark={darkMode}
                  onToggle={() => dispatch(toggleDarkMode())}
                  title={
                    darkMode
                      ? t("common.switch_light")
                      : t("common.switch_dark")
                  }
                />

                <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
              </div>

              {/* Wishlist - Only show for USER role or unauthenticated */}
              {(!isAuthenticated || currentRole === "user") && (
                <Link
                  to="/wishlist"
                  className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 relative inline-flex transition-colors group/nav"
                  title={t("wishlist.title")}
                >
                  <RiHeartLine size={24} />
                  {showWishlistBadge && (
                    <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white dark:border-gray-900 shadow-sm leading-none z-10">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Cart - Only show for USER role or unauthenticated */}
              {(!isAuthenticated || currentRole === "user") && (
                <Link
                  to="/cart"
                  className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 relative inline-flex transition-colors group/nav"
                  title={t("cart.title")}
                >
                  <RiShoppingCartLine size={24} />
                  {showCartBadge && (
                    <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white dark:border-gray-900 shadow-sm leading-none z-10">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Notifications */}
              <NotificationDropdown />

              <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden lg:block" />

              {/* Profile / Auth */}
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <div className="hidden lg:flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    {t("common.login")}
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary py-1.5 px-4 text-xs"
                  >
                    {t("common.register")}
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <RiCloseLine size={24} />
                ) : (
                  <RiMenuLine size={24} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Dropdown Menu ── */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-gray-950">
            {/* Nav links */}
            <div className="container-custom py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2.5 text-sm font-semibold rounded-md transition-colors ${
                      isActive
                        ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {/* Role-based quick links for mobile */}
              {roleBasedLinks.length > 0 && (
                <>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                  <p className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {t("nav.quick_access", "Quick Access")}
                  </p>
                  {roleBasedLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `px-4 py-2.5 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 ${
                          isActive
                            ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`
                      }
                    >
                      <link.icon size={16} />
                      {link.label}
                    </NavLink>
                  ))}
                </>
              )}
            </div>

            {/* Mobile contact info */}
            <div className="container-custom pb-4 border-t border-slate-100 dark:border-slate-800 pt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {contactItems.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon
                    size={15}
                    className="text-primary-600 dark:text-primary-400 shrink-0"
                  />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                      {label}
                    </p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile lang + dark mode */}
            <div className="container-custom pb-4 flex items-center gap-3 border-t border-slate-100 dark:border-slate-800 pt-3">
              <LanguageSwitcher />
              <ThemeToggle
                isDark={darkMode}
                onToggle={() => dispatch(toggleDarkMode())}
                title={
                  darkMode ? t("common.switch_light") : t("common.switch_dark")
                }
              />
            </div>

            {/* Mobile auth buttons */}
            {!isAuthenticated && (
              <div className="container-custom pb-5 grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 text-center text-sm font-bold border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                >
                  {t("common.login")}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary p-2.5 text-center text-sm"
                >
                  {t("common.register")}
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
