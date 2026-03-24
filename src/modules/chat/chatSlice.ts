import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ChatState, Conversation, Message, BulkOrder } from './types';

const initialState: ChatState = {
    conversations: [],
    activeConversation: null,
    messages: [],
    bulkOrders: [],
    isLoading: false,
    error: null,
    isTyping: false,
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setConversations: (state, action: PayloadAction<Conversation[]>) => {
            state.conversations = action.payload;
        },
        addConversation: (state, action: PayloadAction<Conversation>) => {
            const exists = state.conversations.some(c => c.id === action.payload.id);
            if (!exists) state.conversations.unshift(action.payload);
        },
        setActiveConversation: (state, action: PayloadAction<Conversation | null>) => {
            state.activeConversation = action.payload;
            // Mark as read
            if (action.payload) {
                const idx = state.conversations.findIndex(c => c.id === action.payload!.id);
                if (idx !== -1) state.conversations[idx].unreadCount = 0;
            }
        },
        setMessages: (state, action: PayloadAction<Message[]>) => {
            state.messages = action.payload;
        },
        addMessage: (state, action: PayloadAction<Message>) => {
            // Prevent duplicate messages
            const exists = state.messages.some(m => m.id === action.payload.id);
            if (exists) return;
            state.messages.push(action.payload);
            // Update conversation last message + unread count for incoming messages
            const convIdx = state.conversations.findIndex(c => c.id === state.activeConversation?.id);
            if (convIdx !== -1) {
                state.conversations[convIdx].lastMessage = action.payload;
            }
        },
        incrementUnread: (state, action: PayloadAction<string>) => {
            const conv = state.conversations.find(c => c.id === action.payload);
            if (conv) conv.unreadCount += 1;
        },
        updatePriceOfferStatus: (
            state,
            action: PayloadAction<{
                messageId: string;
                status: 'accepted' | 'rejected' | 'countered';
                counterPrice?: number;
            }>
        ) => {
            const msg = state.messages.find(m => m.id === action.payload.messageId);
            if (msg?.priceOffer) {
                msg.priceOffer.status = action.payload.status;
                if (action.payload.counterPrice !== undefined) {
                    msg.priceOffer.counterPrice = action.payload.counterPrice;
                }
            }
            // Update conversation status if accepted
            if (action.payload.status === 'accepted' && state.activeConversation) {
                const convIdx = state.conversations.findIndex(c => c.id === state.activeConversation!.id);
                if (convIdx !== -1) state.conversations[convIdx].status = 'agreed';
                if (state.activeConversation) state.activeConversation.status = 'agreed';
            }
        },
        addBulkOrder: (state, action: PayloadAction<BulkOrder>) => {
            const exists = state.bulkOrders.some(o => o.id === action.payload.id);
            if (!exists) state.bulkOrders.push(action.payload);
        },
        setTyping: (state, action: PayloadAction<boolean>) => {
            state.isTyping = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const {
    setConversations,
    addConversation,
    setActiveConversation,
    setMessages,
    addMessage,
    incrementUnread,
    updatePriceOfferStatus,
    addBulkOrder,
    setTyping,
    setLoading,
    setError,
} = chatSlice.actions;

export default chatSlice.reducer;
