import api from '../shared/api';

export interface Event {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  location: string;
  state?: string;
  district?: string;
  zone?: string;
  startDate: string;
  endDate: string;
  createdByName: string;
  createdByEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  imageUrl?: string;
  location: string;
  state?: string;
  district?: string;
  zone?: string;
  startDate: string;
  endDate: string;
}

export interface UpdateEventPayload extends CreateEventPayload {}

export interface EventFilters {
  search?: string;
  state?: string;
  district?: string;
  zone?: string;
  fromDate?: string;
  toDate?: string;
}

const formatDate = (date: string): string => {
  return new Date(date).toISOString().split('T')[0];
};

const isValidDateInput = (date: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(new Date(date).getTime());
};

const normalizeEventPayload = <T extends CreateEventPayload | UpdateEventPayload>(payload: T): T => {
  if (!isValidDateInput(payload.startDate) || !isValidDateInput(payload.endDate)) {
    throw new Error('Invalid date format. Expected yyyy-MM-dd.');
  }

  const normalized = {
    ...payload,
    startDate: formatDate(payload.startDate),
    endDate: formatDate(payload.endDate),
  };

  if (new Date(normalized.startDate) > new Date(normalized.endDate)) {
    throw new Error('Start date must be before or equal to end date.');
  }

  return normalized as T;
};

interface EventsPageResponse {
  content: Event[];
  totalElements: number;
  totalPages: number;
  number: number;
}

interface ApiResponseEnvelope<T> {
  success: boolean;
  message: string;
  data: T | null;
}

const unwrapApiResponse = <T>(response: { data: ApiResponseEnvelope<T> }): T => {
  const envelope = response?.data;

  if (!envelope?.success) {
    throw new Error(envelope?.message || 'Request failed');
  }

  if (envelope.data === null || envelope.data === undefined) {
    throw new Error(envelope?.message || 'No data returned from server');
  }

  return envelope.data;
};

const unwrapApiResponseNullable = <T>(response: { data: ApiResponseEnvelope<T> }): T | null => {
  const envelope = response?.data;

  if (!envelope?.success) {
    throw new Error(envelope?.message || 'Request failed');
  }

  return envelope.data ?? null;
};

export const eventService = {
  /**
   * Get all events (pagination)
   */
  async getEvents(page = 0, size = 12): Promise<{ data: EventsPageResponse }> {
    const response = await api.get<ApiResponseEnvelope<EventsPageResponse>>('/events', {
      params: { page, size },
    });
    return { data: unwrapApiResponse(response) };
  },

  /**
   * Get events with filters
   */
  async getEventsByFilters(
    filters: EventFilters,
    page = 0,
    size = 12,
  ): Promise<{ data: EventsPageResponse }> {
    const response = await api.get<ApiResponseEnvelope<EventsPageResponse>>('/events/filter', {
      params: { ...filters, page, size },
    });
    return { data: unwrapApiResponse(response) };
  },

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(page = 0, size = 12): Promise<{ data: EventsPageResponse }> {
    const response = await api.get<ApiResponseEnvelope<EventsPageResponse>>('/events/upcoming', {
      params: { page, size },
    });
    return { data: unwrapApiResponse(response) };
  },

  /**
   * Get single event by ID
   */
  async getEventById(id: number): Promise<{ data: Event }> {
    const response = await api.get<ApiResponseEnvelope<Event>>(`/events/${id}`);
    return { data: unwrapApiResponse(response) };
  },

  /**
   * Create event (admin only)
   */
  async createEvent(payload: CreateEventPayload): Promise<{ data: Event }> {
    const normalizedPayload = normalizeEventPayload(payload);
    const response = await api.post<ApiResponseEnvelope<Event>>('/events/admin/events', normalizedPayload);
    return { data: unwrapApiResponse(response) };
  },

  /**
   * Update event (admin only)
   */
  async updateEvent(id: number, payload: UpdateEventPayload): Promise<{ data: Event }> {
    const normalizedPayload = normalizeEventPayload(payload);
    const response = await api.put<ApiResponseEnvelope<Event>>(`/events/admin/events/${id}`, normalizedPayload);
    return { data: unwrapApiResponse(response) };
  },

  /**
   * Delete event (admin only)
   */
  async deleteEvent(id: number): Promise<{ data: null }> {
    const response = await api.delete<ApiResponseEnvelope<null>>(`/events/admin/events/${id}`);
    return { data: unwrapApiResponseNullable(response) };
  },

  /**
   * Get all events for admin
   */
  async getAdminEvents(page = 0, size = 20): Promise<{ data: EventsPageResponse }> {
    const response = await api.get<ApiResponseEnvelope<EventsPageResponse>>('/events/admin/events', {
      params: { page, size },
    });
    return { data: unwrapApiResponse(response) };
  },
};
