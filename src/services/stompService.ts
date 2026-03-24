import SockJS from 'sockjs-client';
import { Client, type IMessage } from '@stomp/stompjs';
import { store } from '../app/store';
import { addRealtimeMessage } from '../modules/bulk/negotiationSlice';
import { addNotification } from '../modules/notifications/notificationSlice';
import type { NegotiationMessage } from '../modules/bulk/types';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080';
const WS_ENABLED = import.meta.env.VITE_WS_ENABLED === 'true';
const IS_DEV = import.meta.env.DEV;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const devLog = (...args: any[]) => { if (IS_DEV) console.log('[STOMP]', ...args); };

class StompService {
    private client: Client | null = null;
    private subscriptions: Map<string, { unsubscribe: () => void }> = new Map();

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!WS_ENABLED) {
                resolve();
                return;
            }

            if (this.client?.connected) {
                resolve();
                return;
            }

            this.client = new Client({
                webSocketFactory: () => new SockJS(`${WS_URL}/ws`),
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                debug: (str) => {
                    if (import.meta.env.DEV) {
                        console.log('[STOMP]', str);
                    }
                },
                onConnect: () => {
                    devLog('Connected');
                    resolve();
                },
                onStompError: (frame) => {
                    console.error('[STOMP] Error:', frame.headers['message']);
                    reject(new Error(frame.headers['message']));
                },
                onDisconnect: () => {
                    devLog('Disconnected');
                },
            });

            this.client.activate();
        });
    }

    subscribeToConversation(conversationId: number): void {
        if (!WS_ENABLED) return;
        const destination = `/topic/negotiation/${conversationId}`;

        // Avoid duplicate subscriptions
        if (this.subscriptions.has(destination)) return;

        if (!this.client?.connected) {
            console.warn('[STOMP] Not connected, cannot subscribe');
            return;
        }

        const subscription = this.client.subscribe(destination, (message: IMessage) => {
            try {
                const msg: NegotiationMessage = JSON.parse(message.body);
                store.dispatch(addRealtimeMessage(msg));
            } catch (e) {
                console.error('[STOMP] Failed to parse message:', e);
            }
        });

        this.subscriptions.set(destination, subscription);
        devLog('Subscribed to:', destination);
    }

    unsubscribeFromConversation(conversationId: number): void {
        if (!WS_ENABLED) return;
        const destination = `/topic/negotiation/${conversationId}`;
        const sub = this.subscriptions.get(destination);
        if (sub) {
            sub.unsubscribe();
            this.subscriptions.delete(destination);
            devLog('Unsubscribed from:', destination);
        }
    }

    sendMessage(conversationId: number, message: string, messageType: string = 'TEXT'): void {
        if (!WS_ENABLED) return;
        if (!this.client?.connected) {
            console.warn('[STOMP] Not connected, cannot send message');
            return;
        }

        this.client.publish({
            destination: '/app/negotiation.send',
            body: JSON.stringify({
                conversationId,
                message,
                messageType,
            }),
        });
    }

    disconnect(): void {
        if (!WS_ENABLED) return;
        this.subscriptions.forEach((sub) => sub.unsubscribe());
        this.subscriptions.clear();

        if (this.client) {
            this.client.deactivate();
            this.client = null;
        }
    }

    // ── Notification subscription ──────────────────────────────────────────────

    subscribeToNotifications(userId: string | number): void {
        if (!WS_ENABLED) return;
        const destination = `/user/${userId}/queue/notifications`;
        if (this.subscriptions.has(destination)) return;
        if (!this.client?.connected) {
            console.warn('[STOMP] Not connected, cannot subscribe to notifications');
            return;
        }

        const subscription = this.client.subscribe(destination, (message: IMessage) => {
            try {
                const notification = JSON.parse(message.body);
                store.dispatch(addNotification(notification));
            } catch (e) {
                console.error('[STOMP] Failed to parse notification:', e);
            }
        });

        this.subscriptions.set(destination, subscription);
        devLog('Subscribed to notifications for user:', userId);
    }

    unsubscribeFromNotifications(userId: string | number): void {
        if (!WS_ENABLED) return;
        const destination = `/user/${userId}/queue/notifications`;
        const sub = this.subscriptions.get(destination);
        if (sub) {
            sub.unsubscribe();
            this.subscriptions.delete(destination);
        }
    }

    // ── Typing indicator ──────────────────────────────────────────────────────

    subscribeToTyping(conversationId: number, onTyping: (senderId: number, isTyping: boolean) => void): void {
        if (!WS_ENABLED) return;
        const destination = `/topic/typing/${conversationId}`;
        if (this.subscriptions.has(destination)) return;
        if (!this.client?.connected) return;

        const subscription = this.client.subscribe(destination, (message: IMessage) => {
            try {
                const event: { senderId: number; isTyping: boolean } = JSON.parse(message.body);
                onTyping(event.senderId, event.isTyping);
            } catch (e) {
                console.error('[STOMP] Failed to parse typing event:', e);
            }
        });

        this.subscriptions.set(destination, subscription);
    }

    unsubscribeFromTyping(conversationId: number): void {
        if (!WS_ENABLED) return;
        const destination = `/topic/typing/${conversationId}`;
        const sub = this.subscriptions.get(destination);
        if (sub) {
            sub.unsubscribe();
            this.subscriptions.delete(destination);
        }
    }

    sendTypingIndicator(conversationId: number, senderId: number, isTyping: boolean): void {
        if (!WS_ENABLED) return;
        if (!this.client?.connected) return;
        this.client.publish({
            destination: '/app/negotiation.typing',
            body: JSON.stringify({ conversationId, senderId, isTyping }),
        });
    }

    // ── Order updates ──────────────────────────────────────────────────────

    subscribeToOrderUpdate(orderId: number, onUpdate: (order: any) => void): void {
        if (!WS_ENABLED) return;
        const destination = `/topic/orders/${orderId}`;
        if (this.subscriptions.has(destination)) return;
        if (!this.client?.connected) {
            console.warn('[STOMP] Not connected, cannot subscribe to order updates');
            return;
        }

        const subscription = this.client.subscribe(destination, (message: IMessage) => {
            try {
                const order = JSON.parse(message.body);
                onUpdate(order);
            } catch (e) {
                console.error('[STOMP] Failed to parse order update:', e);
            }
        });

        this.subscriptions.set(destination, subscription);
        devLog('Subscribed to order updates for order:', orderId);
    }

    unsubscribeFromOrderUpdate(orderId: number): void {
        if (!WS_ENABLED) return;
        const destination = `/topic/orders/${orderId}`;
        const sub = this.subscriptions.get(destination);
        if (sub) {
            sub.unsubscribe();
            this.subscriptions.delete(destination);
            devLog('Unsubscribed from order updates for order:', orderId);
        }
    }

    subscribeToAllOrders(onUpdate: (order: any) => void): void {
        if (!WS_ENABLED) return;
        const destination = `/topic/orders`;
        if (this.subscriptions.has(destination)) return;
        if (!this.client?.connected) {
            console.warn('[STOMP] Not connected, cannot subscribe to all orders');
            return;
        }

        const subscription = this.client.subscribe(destination, (message: IMessage) => {
            try {
                const order = JSON.parse(message.body);
                onUpdate(order);
            } catch (e) {
                console.error('[STOMP] Failed to parse all orders update:', e);
            }
        });

        this.subscriptions.set(destination, subscription);
        devLog('Subscribed to all orders updates');
    }

    unsubscribeFromAllOrders(): void {
        if (!WS_ENABLED) return;
        const destination = `/topic/orders`;
        const sub = this.subscriptions.get(destination);
        if (sub) {
            sub.unsubscribe();
            this.subscriptions.delete(destination);
            devLog('Unsubscribed from all orders updates');
        }
    }

    get isConnected(): boolean {
        if (!WS_ENABLED) return false;
        return this.client?.connected ?? false;
    }
}

export const stompService = new StompService();
