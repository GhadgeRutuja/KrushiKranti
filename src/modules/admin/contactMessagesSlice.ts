import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { contactService, type ContactMessageItem } from '../../services/contactService';

interface AdminContactMessagesState {
  messages: ContactMessageItem[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminContactMessagesState = {
  messages: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

export const fetchAdminContactMessages = createAsyncThunk(
  'adminContactMessages/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await contactService.getAdminContactMessages();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const fetchAdminUnreadContactCount = createAsyncThunk(
  'adminContactMessages/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      return await contactService.getAdminUnreadContactCount();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const markAdminContactMessageReadThunk = createAsyncThunk(
  'adminContactMessages/markRead',
  async (id: number, { rejectWithValue }) => {
    try {
      return await contactService.markAdminContactMessageRead(id);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const deleteAdminContactMessageThunk = createAsyncThunk(
  'adminContactMessages/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await contactService.deleteAdminContactMessage(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

const contactMessagesSlice = createSlice({
  name: 'adminContactMessages',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminContactMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminContactMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
        state.unreadCount = action.payload.filter((item) => item.status === 'UNREAD').length;
      })
      .addCase(fetchAdminContactMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Failed to load contact messages';
      })
      .addCase(fetchAdminUnreadContactCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markAdminContactMessageReadThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.messages.findIndex((message) => message.id === updated.id);
        if (index !== -1) {
          state.messages[index] = updated;
        }
        state.unreadCount = state.messages.filter((item) => item.status === 'UNREAD').length;
      })
      .addCase(deleteAdminContactMessageThunk.fulfilled, (state, action) => {
        state.messages = state.messages.filter((message) => message.id !== action.payload);
        state.unreadCount = state.messages.filter((item) => item.status === 'UNREAD').length;
      });
  },
});

export default contactMessagesSlice.reducer;
