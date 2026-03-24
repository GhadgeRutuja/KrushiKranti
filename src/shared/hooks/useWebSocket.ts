import { useEffect, useRef } from "react";
import { useAppSelector } from "./index";
import { websocketService } from "../../services/websocketService";

/**
 * Custom hook to manage WebSocket connection based on auth state.
 * Connects when user is authenticated, disconnects on logout.
 */
export function useWebSocket() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const connectedRef = useRef(false);

  useEffect(() => {
    const connect = async () => {
      if (isAuthenticated && user?.id && !connectedRef.current) {
        try {
          // Request notification permission before connecting
          websocketService.requestNotificationPermission();

          // Connect to WebSocket
          await websocketService.connect(user.id);
          connectedRef.current = true;

          // Subscribe based on user role
          websocketService.subscribeToUserNotifications(user.id);

          if (user.role === "farmer") {
            websocketService.subscribeToFarmerOrders(user.id);
          }

        } catch (error) {
          console.error("Failed to connect WebSocket:", error);
          connectedRef.current = false;
        }
      }
    };

    const disconnect = () => {
      if (!isAuthenticated && connectedRef.current) {
        websocketService.disconnect();
        connectedRef.current = false;
      }
    };

    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      // Cleanup on unmount
      if (connectedRef.current) {
        websocketService.disconnect();
        connectedRef.current = false;
      }
    };
  }, [isAuthenticated, user?.id, user?.role]);

  return {
    isConnected: connectedRef.current,
  };
}
