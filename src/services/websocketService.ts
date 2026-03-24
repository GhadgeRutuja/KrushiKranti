import { io, Socket } from "socket.io-client";
import { store } from "../app/store";
import { addNotification, type NotificationType } from "../modules/notifications/notificationSlice";

const WS_BASE_URL = import.meta.env.VITE_WS_URL || "http://localhost:8080";
const WS_ENABLED = import.meta.env.VITE_WS_ENABLED !== 'false';
const IS_DEV = import.meta.env.DEV;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const devLog = (...args: any[]) => { if (IS_DEV) console.log('[WS]', ...args); };

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Connect to WebSocket server
   */
  connect(userId?: string | number): Promise<void> {
    return new Promise((resolve, reject) => {
      // Skip WebSocket connection if disabled
      if (!WS_ENABLED) {
        devLog("WebSocket disabled via VITE_WS_ENABLED=false");
        resolve();
        return;
      }

      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(WS_BASE_URL, {
        transports: ["websocket", "polling"],
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 3000,
        autoConnect: true,
        withCredentials: true,
      });

      this.socket.on("connect", () => {
        devLog("Connected");
        this.reconnectAttempts = 0;

        // Join rooms based on userId
        if (userId) {
          this.socket?.emit("join", { userId });
        }

        resolve();
      });

      this.socket.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error);
        this.handleReconnect();
        reject(error);
      });

      this.socket.on("disconnect", (reason) => {
        devLog("Disconnected:", reason);
      });

      // Listen for order notifications
      this.socket.on("order", (data) => {
        this.handleOrderNotification(data);
      });

      // Listen for generic notifications
      this.socket.on("notification", (data) => {
        this.handleNotification(data);
      });

      // Listen for order status updates
      this.socket.on("order_update", (data) => {
        this.handleOrderStatusUpdate(data);
      });

      // Listen for delivery updates
      this.socket.on("delivery_update", (data) => {
        this.handleDeliveryUpdate(data);
      });
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Subscribe to user-specific notifications
   */
  subscribeToUserNotifications(userId: string | number): void {
    if (!this.socket?.connected) return;
    this.socket.emit("subscribe", { channel: `notifications_${userId}` });
  }

  /**
   * Subscribe to farmer-specific orders
   */
  subscribeToFarmerOrders(farmerId: string | number): void {
    if (!this.socket?.connected) return;
    this.socket.emit("subscribe", { channel: `orders_farmer_${farmerId}` });
  }

  /**
   * Handle order notification
   */
  private handleOrderNotification(data: {
    orderId: number;
    productName: string;
    customerName: string;
    quantity: number;
    totalAmount: number;
  }): void {
    devLog("Order notification:", data);

    // Dispatch notification to Redux store
    store.dispatch(
      addNotification({
        id: `order_${data.orderId}_${Date.now()}`,
        type: "order_placed",
        message: `New Order Received\nProduct: ${data.productName}\nCustomer: ${data.customerName}\nQuantity: ${data.quantity}\nAmount: ₹${data.totalAmount}`,
        time: new Date().toISOString(),
        isRead: false,
        link: `/orders/${data.orderId}`,
      }),
    );

    // Show browser notification if permission granted
    this.showBrowserNotification(
      "New Order Received",
      `Product: ${data.productName}\nAmount: ₹${data.totalAmount}`,
    );
  }

  /**
   * Handle generic notification
   */
  private handleNotification(data: {
    id?: string | number;
    type?: string;
    title?: string;
    message?: string;
    createdAt?: string;
    referenceType?: string;
    referenceId?: string | number;
  }): void {
    devLog("Notification:", data);

    const notifType = (data.type?.toLowerCase() || "system") as NotificationType;

    store.dispatch(
      addNotification({
        id: data.id?.toString() || `notif_${Date.now()}`,
        type: notifType,
        message: data.message || data.title || "",
        time: data.createdAt || new Date().toISOString(),
        isRead: false,
        link:
          data.referenceType === "ORDER"
            ? `/orders/${data.referenceId}`
            : undefined,
      }),
    );

    if (data.title && data.message) {
      this.showBrowserNotification(data.title, data.message);
    }
  }

  /**
   * Handle order status update
   */
  private handleOrderStatusUpdate(data: {
    orderId: number;
    status: string;
    message?: string;
  }): void {
    devLog("Order status update:", data);

    store.dispatch(
      addNotification({
        id: `status_${data.orderId}_${Date.now()}`,
        type: "order_shipped",
        message:
          data.message ||
          `Order #${data.orderId} status updated to ${data.status}`,
        time: new Date().toISOString(),
        isRead: false,
        link: `/orders/${data.orderId}`,
      }),
    );

    this.showBrowserNotification(
      "Order Update",
      `Order #${data.orderId} - ${data.status}`,
    );
  }

  /**
   * Handle delivery update
   */
  private handleDeliveryUpdate(data: {
    orderId: number;
    deliveryStatus: string;
    estimatedDelivery?: string;
  }): void {
    devLog("Delivery update:", data);

    store.dispatch(
      addNotification({
        id: `delivery_${data.orderId}_${Date.now()}`,
        type: "order_shipped",
        message: `Delivery Update: Order #${data.orderId} - ${data.deliveryStatus}`,
        time: new Date().toISOString(),
        isRead: false,
        link: `/orders/${data.orderId}/track`,
      }),
    );
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(title: string, body: string): void {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
    }
  }

  /**
   * Request browser notification permission
   */
  requestNotificationPermission(): void {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  /**
   * Handle reconnection
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      devLog(
        `Reconnecting… (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      );
    } else {
      console.error("Max reconnection attempts reached");
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
