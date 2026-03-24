import type { Event } from '../../services/eventService';

export interface EventsState {
  events: Event[];
  currentEvent: Event | null;
  totalElements: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
}
