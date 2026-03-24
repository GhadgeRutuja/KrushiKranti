import { io, Socket } from 'socket.io-client';
import { store } from '../app/store';
import { addMessage, setTyping } from '../modules/chat/chatSlice';
import type { Message } from '../modules/chat/types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const IS_DEV = import.meta.env.DEV;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const devLog = (...args: any[]) => { if (IS_DEV) console.log('[Socket]', ...args); };

class SocketService {
    private socket: Socket | null = null;
    private isInitializing: boolean = false;

    connect(userId: string) {
        if (this.socket?.connected || this.isInitializing) return;
        this.isInitializing = true;

        try {
            this.socket = io(SOCKET_URL, {
                transports: ['websocket'],
                query: { userId },
                reconnectionAttempts: 3,
                timeout: 5000,
                autoConnect: true
            });
        } catch (error) {
            console.warn('[Socket] Initialization failed:', error);
            this.isInitializing = false;
            return;
        }

        this.socket.on('connect', () => {
            devLog('Connected as:', userId);
            this.isInitializing = false;
            this.socket?.emit('join', userId);
        });

        this.socket.on('receiveMessage', (message: Message) => {
            devLog('Message received:', message);
            store.dispatch(addMessage(message));
        });

        this.socket.on('userTyping', ({ userId, isTyping }: { userId: string, isTyping: boolean }) => {
            // Logic for multi-user typing can be added to chatSlice if needed
            // For now we just use the global setTyping for the active conversation
            const activeConv = store.getState().chat.activeConversation;
            if (activeConv && activeConv.participants.some(p => p.id === userId)) {
                store.dispatch(setTyping(isTyping));
            }
        });

        this.socket.on('disconnect', () => {
            devLog('Disconnected');
            this.isInitializing = false;
        });

        this.socket.on('connect_error', (error) => {
            console.warn('[Socket] Server unavailable or connection failed:', error.message);
            this.isInitializing = false;
            // Stop trying after initial failure to prevent loop if backend is truly down
            if (this.socket) {
                this.socket.disconnect();
            }
        });
    }

    sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) {
        if (!this.socket?.connected) {
            console.error('[Socket] Not connected. Cannot send message.');
            return;
        }

        const fullMessage: Message = {
            ...message,
            id: Math.random().toString(36).substring(7),
            timestamp: new Date().toISOString(),
            isRead: false,
        };

        // Emit to server
        this.socket.emit('sendMessage', fullMessage);

        // Also add to local state immediately for UX (optimistic update)
        // In a real app, you might wait for server ACK or use a temp ID
        store.dispatch(addMessage(fullMessage));
    }

    emitTyping(receiverId: string, isTyping: boolean) {
        this.socket?.emit('typing', { receiverId, isTyping });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.isInitializing = false;
    }

    get isConnected() {
        return this.socket?.connected || false;
    }
}

export const socketService = new SocketService();
