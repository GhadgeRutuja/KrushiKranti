import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Event, EventFilters } from "../../services/eventService";
import { eventService } from "../../services/eventService";
import { getErrorMessage } from "../../utils/errorHandler";

const normalizePagePayload = (payload: any) => ({
  content: Array.isArray(payload?.content) ? payload.content : [],
  totalElements: Number(payload?.totalElements ?? 0),
  totalPages: Number(payload?.totalPages ?? 0),
  number: Number(payload?.number ?? 0),
});

interface EventsState {
  events: Event[];
  currentEvent: Event | null;
  totalElements: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
}

const initialState: EventsState = {
  events: [],
  currentEvent: null,
  totalElements: 0,
  totalPages: 0,
  loading: false,
  error: null,
  currentPage: 0,
  pageSize: 12,
};

// Async thunks for farmers (view only)
export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (
    { page, size }: { page: number; size: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await eventService.getEvents(page, size);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load events"));
    }
  },
);

export const fetchEventsByFilters = createAsyncThunk(
  "events/fetchEventsByFilters",
  async (
    {
      filters,
      page,
      size,
    }: { filters: EventFilters; page: number; size: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await eventService.getEventsByFilters(
        filters,
        page,
        size,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load filtered events"),
      );
    }
  },
);

export const fetchUpcomingEvents = createAsyncThunk(
  "events/fetchUpcomingEvents",
  async (
    { page, size }: { page: number; size: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await eventService.getUpcomingEvents(page, size);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load upcoming events"),
      );
    }
  },
);

export const fetchEventById = createAsyncThunk(
  "events/fetchEventById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await eventService.getEventById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load event"));
    }
  },
);

// Async thunks for admins (CRUD)
export const createEventThunk = createAsyncThunk(
  "events/createEvent",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await eventService.createEvent(payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create event"));
    }
  },
);

export const updateEventThunk = createAsyncThunk(
  "events/updateEvent",
  async (
    { id, payload }: { id: number; payload: any },
    { rejectWithValue },
  ) => {
    try {
      const response = await eventService.updateEvent(id, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update event"));
    }
  },
);

export const deleteEventThunk = createAsyncThunk(
  "events/deleteEvent",
  async (id: number, { rejectWithValue }) => {
    try {
      await eventService.deleteEvent(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete event"));
    }
  },
);

export const fetchAdminEvents = createAsyncThunk(
  "events/fetchAdminEvents",
  async (
    { page, size }: { page: number; size: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await eventService.getAdminEvents(page, size);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load events"));
    }
  },
);

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Events
    builder.addCase(fetchEvents.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchEvents.fulfilled, (state, action) => {
      const pageData = normalizePagePayload(action.payload);
      state.loading = false;
      state.events = pageData.content;
      state.totalElements = pageData.totalElements;
      state.totalPages = pageData.totalPages;
      state.currentPage = pageData.number;
    });
    builder.addCase(fetchEvents.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Events by Filters
    builder.addCase(fetchEventsByFilters.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchEventsByFilters.fulfilled, (state, action) => {
      const pageData = normalizePagePayload(action.payload);
      state.loading = false;
      state.events = pageData.content;
      state.totalElements = pageData.totalElements;
      state.totalPages = pageData.totalPages;
      state.currentPage = pageData.number;
    });
    builder.addCase(fetchEventsByFilters.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Upcoming Events
    builder.addCase(fetchUpcomingEvents.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUpcomingEvents.fulfilled, (state, action) => {
      const pageData = normalizePagePayload(action.payload);
      state.loading = false;
      state.events = pageData.content;
      state.totalElements = pageData.totalElements;
      state.totalPages = pageData.totalPages;
      state.currentPage = pageData.number;
    });
    builder.addCase(fetchUpcomingEvents.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Event by ID
    builder.addCase(fetchEventById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchEventById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentEvent = action.payload ?? null;
    });
    builder.addCase(fetchEventById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create Event
    builder.addCase(createEventThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createEventThunk.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload) {
        state.events.unshift(action.payload);
        state.totalElements += 1;
      }
    });
    builder.addCase(createEventThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Event
    builder.addCase(updateEventThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateEventThunk.fulfilled, (state, action) => {
      state.loading = false;
      if (!action.payload) {
        return;
      }
      const index = state.events.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.events[index] = action.payload;
      }
      if (state.currentEvent?.id === action.payload.id) {
        state.currentEvent = action.payload;
      }
    });
    builder.addCase(updateEventThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete Event
    builder.addCase(deleteEventThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteEventThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.events = state.events.filter((e) => e.id !== action.payload);
      state.totalElements -= 1;
    });
    builder.addCase(deleteEventThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Admin Events
    builder.addCase(fetchAdminEvents.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAdminEvents.fulfilled, (state, action) => {
      const pageData = normalizePagePayload(action.payload);
      state.loading = false;
      state.events = pageData.content;
      state.totalElements = pageData.totalElements;
      state.totalPages = pageData.totalPages;
      state.currentPage = pageData.number;
    });
    builder.addCase(fetchAdminEvents.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError, setCurrentPage } = eventsSlice.actions;
export default eventsSlice.reducer;
