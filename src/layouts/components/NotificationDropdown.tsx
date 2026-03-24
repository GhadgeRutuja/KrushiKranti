import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  RiNotification3Line,
  RiShoppingBag3Line,
  RiCheckboxCircleLine,
  RiBox3Line,
  RiMessage3Line,
  RiStarLine,
  RiTruckLine,
  RiMapPinLine,
  RiSettings3Line,
  RiLoader4Line,
} from "react-icons/ri";
import { useAppDispatch, useAppSelector } from "../../shared/hooks";
import {
  markNotificationReadThunk,
  markAllNotificationsReadThunk,
  fetchNotifications,
  type NotificationType,
} from "../../modules/notifications/notificationSlice";

const typeIcon: Record<NotificationType, React.ElementType> = {
  order_placed: RiShoppingBag3Line,
  order_shipped: RiTruckLine,
  order_delivered: RiCheckboxCircleLine,
  delivery_update: RiMapPinLine,
  product_approved: RiCheckboxCircleLine,
  bulk_request: RiBox3Line,
  price_negotiation: RiMessage3Line,
  new_review: RiStarLine,
  system: RiSettings3Line,
};

const typeColor: Record<NotificationType, string> = {
  order_placed:
    "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  order_shipped:
    "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  order_delivered:
    "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  delivery_update:
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  product_approved:
    "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  bulk_request:
    "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  price_negotiation:
    "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  new_review:
    "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  system: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
};

export function NotificationDropdown() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading } = useAppSelector(
    (state) => state.notifications,
  );
  const { role, user } = useAppSelector((state) => state.auth);
  const currentRole = role ?? user?.role ?? null;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchNotifications());
    }
  }, [isOpen, dispatch]);

  const handleNotificationClick = (id: string, link?: string, referenceType?: string, referenceId?: number) => {
    dispatch(markNotificationReadThunk(id));
    setIsOpen(false);
    if (!link) return;
    // Resolve role-specific bulk order tracking links
    if (referenceType === 'BULK_ORDER' && referenceId !== undefined) {
      const prefix = currentRole === 'farmer' ? '/farmer' : '/wholesaler';
      navigate(`${prefix}/orders/track/${referenceId}`);
    } else {
      navigate(link);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 transition-none relative"
        title={t("notifications.title")}
      >
        <RiNotification3Line size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white dark:border-gray-900 shadow-sm leading-none z-10">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-[200]">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {t("notifications.title")}
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => dispatch(markAllNotificationsReadThunk())}
                className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest"
              >
                {t("notifications.mark_all_read")}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
            {isLoading ? (
              <div className="py-10 text-center">
                <RiLoader4Line size={24} className="mx-auto text-green-500 animate-spin mb-2" />
                <p className="text-xs text-slate-400">{t("notifications.loading")}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <RiNotification3Line
                  size={28}
                  className="mx-auto text-slate-300 dark:text-slate-600 mb-2"
                />
                <p className="text-xs text-slate-400">{t("notifications.empty")}</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const Icon = typeIcon[notif.type];
                const colorClass = typeColor[notif.type];
                return (
                  <button
                    key={notif.id}
                    onClick={() =>
                      handleNotificationClick(notif.id, notif.link, notif.referenceType, notif.referenceId)
                    }
                    className={`w-full text-left p-3 flex gap-3 transition-colors ${
                      notif.isRead
                        ? "bg-white dark:bg-gray-900"
                        : "bg-green-50/50 dark:bg-green-900/10"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}
                    >
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-[11px] leading-snug ${notif.isRead ? "text-slate-600 dark:text-slate-400" : "text-slate-800 dark:text-slate-200 font-semibold"}`}
                      >
                        {notif.message}
                      </p>
                      <span className="text-[9px] text-slate-400 mt-1 block uppercase font-bold">
                        {notif.time}
                      </span>
                    </div>
                    {!notif.isRead && (
                      <span className="w-2 h-2 bg-green-500 rounded-full shrink-0 mt-1.5" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2.5">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest"
            >
              {t("notifications.close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
