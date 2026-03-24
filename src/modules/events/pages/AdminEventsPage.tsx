import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../shared/hooks";
import { fetchAdminEvents, deleteEventThunk, clearError } from "../eventsSlice";
import {
  RiAddLine,
  RiEdit2Line,
  RiDeleteBinLine,
  RiLoader4Line,
  RiCalendarLine,
  RiMapPinLine,
  RiUserLine,
} from "react-icons/ri";
import toast from "react-hot-toast";
import { Navigate } from "react-router-dom";
import { AddEventModal } from "../components/AddEventModal";
import { EditEventModal } from "../components/EditEventModal";
import type { Event } from "../../../services/eventService";
import type { RootState } from "../../../app/store";

const FALLBACK_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80";

export function AdminEventsPage() {
  const dispatch = useAppDispatch();
  const eventsState = useAppSelector((state: RootState) => state.events);
  const authState = useAppSelector((state: RootState) => state.auth);
  const currentRole = (authState.role ?? authState.user?.role ?? "")
    .toString()
    .toLowerCase();

  const events = Array.isArray(eventsState?.events) ? eventsState.events : [];
  const loading = eventsState?.loading ?? false;
  const error = eventsState?.error ?? null;
  const currentPage = eventsState?.currentPage ?? 0;
  const totalPages = eventsState?.totalPages ?? 0;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  if (currentRole && currentRole !== "admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  useEffect(() => {
    dispatch(fetchAdminEvents({ page: 0, size: 20 }));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleEditClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) {
      return;
    }
    const result = await dispatch(deleteEventThunk(eventToDelete.id));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Event deleted successfully");
      setEventToDelete(null);
    }
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    dispatch(fetchAdminEvents({ page: 0, size: 20 }));
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedEvent(null);
    dispatch(fetchAdminEvents({ page: currentPage, size: 20 }));
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages - 1) {
      dispatch(fetchAdminEvents({ page: currentPage + 1, size: 20 }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="kk-page-surface">
      <div className="border-b border-primary-100 dark:border-gray-800 bg-linear-to-r from-primary-100 via-primary-50 to-white dark:from-gray-900 dark:to-gray-950 py-8 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-gray-100 mb-2">
              Manage Events
            </h1>
            <p className="text-slate-600 dark:text-gray-400">
              Create, edit, and delete agricultural events
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all duration-300"
          >
            <RiAddLine size={20} />
            Add Event
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        {loading && events?.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <RiLoader4Line className="text-primary-600 dark:text-primary-400 text-4xl animate-spin" />
            <span className="ml-3 text-slate-700 dark:text-gray-300">
              Loading events...
            </span>
          </div>
        )}

        {!loading && events?.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="max-h-[70vh] overflow-auto">
              <table className="w-full min-w-255">
                <thead className="sticky top-0 z-10 bg-primary-50/95 dark:bg-gray-900/95 backdrop-blur border-b border-slate-200 dark:border-gray-800">
                <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-gray-300">
                    Image
                  </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-gray-300">
                    Title
                  </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-gray-300">
                    Location
                  </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-gray-300">
                    State
                  </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-gray-300">
                    Dates
                  </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-gray-300">
                    Created By
                  </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {events?.map((event: Event, index: number) => (
                  <tr
                    key={event.id}
                    className={`border-b border-gray-700 dark:border-gray-800 ${
                      index % 2 === 0
                          ? "bg-white dark:bg-gray-900"
                          : "bg-slate-50/70 dark:bg-gray-900/70"
                      } hover:bg-primary-50/60 dark:hover:bg-gray-800/70 transition-all duration-300`}
                  >
                    <td className="px-5 py-4">
                      <img
                        src={event.imageUrl || FALLBACK_EVENT_IMAGE}
                        alt={event.title}
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_EVENT_IMAGE;
                        }}
                        className="h-12 w-16 rounded-lg object-cover border border-slate-200 dark:border-gray-700"
                      />
                    </td>
                    <td className="px-5 py-4 text-slate-900 dark:text-gray-100 font-semibold">
                      {event.title}
                      {event.zone && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-primary-100 dark:bg-primary-900/40 px-2 py-0.5 text-[11px] font-medium text-primary-700 dark:text-primary-300">
                          {event.zone}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-gray-400">
                      <span className="inline-flex items-center gap-1.5">
                        <RiMapPinLine className="text-primary-600 dark:text-primary-400" />
                        {event.location || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-gray-400">
                      {event.state || "-"}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-gray-400 text-sm">
                      <div className="inline-flex items-center gap-1.5">
                        <RiCalendarLine className="text-primary-600 dark:text-primary-400" />
                        <span>
                          {formatDate(event.startDate)} - {formatDate(event.endDate)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-gray-400 text-sm">
                      <div className="inline-flex items-center gap-1.5">
                        <RiUserLine className="text-primary-600 dark:text-primary-400" />
                        <span>{event.createdByName || event.createdByEmail || "System"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(event)}
                          className="p-2 hover:bg-slate-200 dark:hover:bg-gray-700 rounded-lg transition-all duration-300 text-slate-600 dark:text-gray-300"
                          title="Edit"
                        >
                          <RiEdit2Line size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(event)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-300 text-red-500"
                          title="Delete"
                        >
                          <RiDeleteBinLine size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && events?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800">
            <RiCalendarLine className="text-4xl text-slate-400 dark:text-gray-500 mb-3" />
            <p className="text-slate-700 dark:text-gray-300 text-lg mb-2">
              No events created yet
            </p>
            <p className="text-slate-500 dark:text-gray-500 text-sm">
              Click "Add Event" to create your first event
            </p>
          </div>
        )}

        {!loading && currentPage < totalPages - 1 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleLoadMore}
              className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all duration-300"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddEventModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}
      {showEditModal && selectedEvent && (
        <EditEventModal
          event={selectedEvent}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {eventToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">
              Delete Event
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-gray-400">
              Are you sure you want to delete
              <span className="font-medium text-slate-900 dark:text-gray-200">
                {" "}
                {eventToDelete.title}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setEventToDelete(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
