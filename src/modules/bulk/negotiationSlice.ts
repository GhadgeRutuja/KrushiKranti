import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { NegotiationConversation, NegotiationMessage, DealOffer } from './types';
import * as bulkService from './bulkService';

interface NegotiationState {
    conversations: NegotiationConversation[];
    activeConversation: NegotiationConversation | null;
    messages: NegotiationMessage[];
    deals: DealOffer[];
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
}

const initialState: NegotiationState = {
    conversations: [],
    activeConversation: null,
    messages: [],
    deals: [],
    isLoading: false,
    isSubmitting: false,
    error: null,
};

export const fetchConversations = createAsyncThunk(
    'negotiation/fetchConversations',
    async (_, { rejectWithValue }) => {
        try {
            return await bulkService.fetchConversations();
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    },
);

export const startNegotiation = createAsyncThunk(
    'negotiation/start',
    async (bulkProductId: number, { rejectWithValue }) => {
        try {
            return await bulkService.startNegotiation(bulkProductId);
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    },
);

export const fetchMessages = createAsyncThunk(
    'negotiation/fetchMessages',
    async (conversationId: number, { rejectWithValue }) => {
        try {
            return await bulkService.fetchMessages(conversationId);
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    },
);

export const sendMessage = createAsyncThunk(
    'negotiation/sendMessage',
    async (
        { conversationId, message, messageType }: { conversationId: number; message: string; messageType?: string },
        { rejectWithValue },
    ) => {
        try {
            return await bulkService.sendNegotiationMessage(conversationId, message, messageType);
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    },
);

export const createDeal = createAsyncThunk(
    'negotiation/createDeal',
    async (data: { conversationId: number; pricePerUnit: number; quantity: number }, { rejectWithValue }) => {
        try {
            return await bulkService.createDealOffer(data);
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    },
);

export const respondDeal = createAsyncThunk(
    'negotiation/respondDeal',
    async ({ dealOfferId, action }: { dealOfferId: number; action: 'ACCEPT' | 'REJECT' }, { rejectWithValue }) => {
        try {
            return await bulkService.respondToDeal(dealOfferId, action);
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    },
);

export const fetchDeals = createAsyncThunk(
    'negotiation/fetchDeals',
    async (conversationId: number, { rejectWithValue }) => {
        try {
            return await bulkService.fetchDeals(conversationId);
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    },
);

const negotiationSlice = createSlice({
    name: 'negotiation',
    initialState,
    reducers: {
        setActiveConversation: (state, action: PayloadAction<NegotiationConversation | null>) => {
            state.activeConversation = action.payload;
        },
        addRealtimeMessage: (state, action: PayloadAction<NegotiationMessage>) => {
            const exists = state.messages.some((m) => m.id === action.payload.id);
            if (!exists) {
                state.messages.push(action.payload);
            }
        },
        clearMessages: (state) => {
            state.messages = [];
            state.deals = [];
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Conversations
            .addCase(fetchConversations.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchConversations.fulfilled, (state, action: PayloadAction<NegotiationConversation[]>) => {
                state.isLoading = false;
                state.conversations = action.payload;
            })
            .addCase(fetchConversations.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Start negotiation
            .addCase(startNegotiation.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(startNegotiation.fulfilled, (state, action: PayloadAction<NegotiationConversation>) => {
                state.isSubmitting = false;
                state.activeConversation = action.payload;
                const exists = state.conversations.some((c) => c.id === action.payload.id);
                if (!exists) state.conversations.unshift(action.payload);
            })
            .addCase(startNegotiation.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })
            // Messages
            .addCase(fetchMessages.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMessages.fulfilled, (state, action: PayloadAction<NegotiationMessage[]>) => {
                state.isLoading = false;
                state.messages = action.payload;
            })
            .addCase(fetchMessages.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Send message
            .addCase(sendMessage.pending, (state) => {
                state.isSubmitting = true;
            })
            .addCase(sendMessage.fulfilled, (state, action: PayloadAction<NegotiationMessage>) => {
                state.isSubmitting = false;
                const exists = state.messages.some((m) => m.id === action.payload.id);
                if (!exists) state.messages.push(action.payload);
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })
            // Create deal
            .addCase(createDeal.pending, (state) => {
                state.isSubmitting = true;
            })
            .addCase(createDeal.fulfilled, (state, action: PayloadAction<DealOffer>) => {
                state.isSubmitting = false;
                state.deals.unshift(action.payload);
            })
            .addCase(createDeal.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })
            // Respond to deal
            .addCase(respondDeal.fulfilled, (state, action: PayloadAction<DealOffer>) => {
                const idx = state.deals.findIndex((d) => d.id === action.payload.id);
                if (idx !== -1) state.deals[idx] = action.payload;
                // Update conversation status if deal is accepted
                if (action.payload.status === 'ACCEPTED' && state.activeConversation) {
                    state.activeConversation.status = 'AGREED';
                    const cIdx = state.conversations.findIndex((c) => c.id === state.activeConversation?.id);
                    if (cIdx !== -1) state.conversations[cIdx].status = 'AGREED';
                }
            })
            // Fetch deals
            .addCase(fetchDeals.fulfilled, (state, action: PayloadAction<DealOffer[]>) => {
                state.deals = action.payload;
            });
    },
});

export const { setActiveConversation, addRealtimeMessage, clearMessages, clearError } = negotiationSlice.actions;
export default negotiationSlice.reducer;
