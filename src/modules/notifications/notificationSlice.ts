import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

type BackendNotificationType =
    | 'ORDER_PLACED'
    | 'ORDER_CONFIRMED'
    | 'ORDER_SHIPPED'
    | 'ORDER_DELIVERED'
    | 'ORDER_CANCELLED'
    | 'PAYMENT_RECEIVED'
    | 'PRODUCT_APPROVED'
    | 'PRODUCT_REJECTED'
    | 'NEW_REVIEW'
    | 'PRICE_NEGOTIATION'
    | 'SYSTEM';

export type NotificationType =
    | 'order_placed'
    | 'order_shipped'
    | 'order_delivered'
    | 'delivery_update'
    | 'product_approved'
    | 'bulk_request'
    | 'price_negotiation'
    | 'new_review'
    | 'system';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    link?: string;
    referenceId?: number;
    referenceType?: string;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
}

function backendTypeToFrontend(type: BackendNotificationType): NotificationType {
    const map: Record<BackendNotificationType, NotificationType> = {
        ORDER_PLACED: 'order_placed',
        ORDER_CONFIRMED: 'order_placed',
        ORDER_SHIPPED: 'order_shipped',
        ORDER_DELIVERED: 'order_delivered',
        ORDER_CANCELLED: 'delivery_update',
        PAYMENT_RECEIVED: 'order_placed',
        PRODUCT_APPROVED: 'product_approved',
        PRODUCT_REJECTED: 'product_approved',
        NEW_REVIEW: 'new_review',
        PRICE_NEGOTIATION: 'price_negotiation',
        SYSTEM: 'system',
    };
    return map[type] ?? 'system';
}

function buildLink(referenceType?: string, referenceId?: number): string | undefined {
    if (!referenceType || referenceId === undefined) return undefined;
    switch (referenceType) {
        case 'ORDER': return '/orders';
        case 'BULK_ORDER': return '/orders/track/' + referenceId;
        case 'PRODUCT': return '/products/' + referenceId;
        case 'NEGOTIATION': return '/wholesaler/negotiations/' + referenceId;
        default: return undefined;
    }
}

function formatTime(createdAt: string): string {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return diffMins + 'm ago';
    if (diffHours < 24) return diffHours + 'h ago';
    return diffDays + 'd ago';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBackendNotification(n: any): Notification {
    return {
        id: String(n.id),
        type: backendTypeToFrontend(n.type as BackendNotificationType),
        title: n.title ?? '',
        message: n.message ?? '',
        time: n.createdAt ? formatTime(n.createdAt) : '',
        isRead: n.isRead ?? false,
        referenceId: n.referenceId,
        referenceType: n.referenceType,
        link: buildLink(n.referenceType, n.referenceId),
    };
}

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
};

export const fetchNotifications = createAsyncThunk(
    'notifications/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/notifications');
            return res.data.data as unknown[];
        } catch (err) {
            return rejectWithValue((err as Error).message);
        }
    }
);

export const fetchUnreadCount = createAsyncThunk(
    'notifications/fetchUnreadCount',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/notifications/unread-count');
            return (res.data.data as { count: number }).count;
        } catch (err) {
            return rejectWithValue((err as Error).message);
        }
    }
);

export const markNotificationReadThunk = createAsyncThunk(
    'notifications/markRead',
    async (id: string, { rejectWithValue }) => {
        try {
            await api.put('/notifications/' + id + '/read');
            return id;
        } catch (err) {
            return rejectWithValue((err as Error).message);
        }
    }
);

export const markAllNotificationsReadThunk = createAsyncThunk(
    'notifications/markAllRead',
    async (_, { rejectWithValue }) => {
        try {
            await api.put('/notifications/mark-all-read');
        } catch (err) {
            return rejectWithValue((err as Error).message);
        }
    }
);

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        addNotification: (state, action: PayloadAction<any>) => {
            const mapped = mapBackendNotification(action.payload);
            state.notifications.unshift(mapped);
            state.unreadCount += 1;
        },
        markAsRead: (state, action: PayloadAction<string>) => {
            const notif = state.notifications.find((n) => n.id === action.payload);
            if (notif) {
                notif.isRead = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        markAllAsRead: (state) => {
            state.notifications.forEach((n) => (n.isRead = true));
            state.unreadCount = 0;
        },
        clearNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.isLoading = false;
                state.notifications = (action.payload as unknown[]).map(mapBackendNotification);
                state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
            })
            .addCase(fetchNotifications.rejected, (state) => {
                state.isLoading = false;
            })
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload;
            })
            .addCase(markNotificationReadThunk.fulfilled, (state, action) => {
                const notif = state.notifications.find((n) => n.id === action.payload);
                if (notif && !notif.isRead) {
                    notif.isRead = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            .addCase(markAllNotificationsReadThunk.fulfilled, (state) => {
                state.notifications.forEach((n) => (n.isRead = true));
                state.unreadCount = 0;
            });
    },
});

export const { markAsRead, markAllAsRead, clearNotifications, addNotification } =
    notificationSlice.actions;
export default notificationSlice.reducer;
