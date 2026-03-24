import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../shared/hooks";
import { fetchEventsByFilters, fetchEvents, clearError } from "../eventsSlice";
import {
  RiCalendarLine,
  RiMapPinLine,
  RiSearchLine,
  RiLoader4Line,
  RiFilter3Line,
  RiArrowRightSLine,
} from "react-icons/ri";
import toast from "react-hot-toast";
import { Navigate } from "react-router-dom";

const FALLBACK_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80";

type EventTab = "all" | "upcoming" | "ongoing" | "past";

interface Filters {
  search: string;
  state: string;
  district: string;
  zone: string;
  fromDate: string;
  toDate: string;
}

export function EventsPage() {
  const dispatch = useAppDispatch();

  const { events, loading, error, totalPages, currentPage } = useAppSelector(
    (state) => state.events,
  );
  const authState = useAppSelector((state) => state.auth);
  const currentRole = (authState.role ?? authState.user?.role ?? "")
    .toString()
    .toLowerCase();

  const [activeTab, setActiveTab] = useState<EventTab>("all");

  const [filters, setFilters] = useState<Filters>({
    search: "",
    state: "",
    district: "",
    zone: "",
    fromDate: "",
    toDate: "",
  });

  useEffect(() => {
    dispatch(fetchEvents({ page: 0, size: 12 }));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApplyFilters = () => {
    const hasFilters = Object.values(filters).some((v) => v !== "");
    if (hasFilters) {
      dispatch(
        fetchEventsByFilters({
          filters: {
            search: filters.search || undefined,
            state: filters.state || undefined,
            district: filters.district || undefined,
            zone: filters.zone || undefined,
            fromDate: filters.fromDate || undefined,
            toDate: filters.toDate || undefined,
          },
          page: 0,
          size: 12,
        }),
      );
    } else {
      dispatch(fetchEvents({ page: 0, size: 12 }));
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      state: "",
      district: "",
      zone: "",
      fromDate: "",
      toDate: "",
    });
    dispatch(fetchEvents({ page: 0, size: 12 }));
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages - 1) {
      dispatch(
        fetchEvents({
          page: currentPage + 1,
          size: 12,
        }),
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getEventStatus = (startDate: string, endDate: string): EventTab => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (today < start) {
      return "upcoming";
    }
    if (today > end) {
      return "past";
    }
    return "ongoing";
  };

  const tabCounts = useMemo(() => {
    const safeEvents = Array.isArray(events) ? events : [];
    return {
      all: safeEvents.length,
      upcoming: safeEvents.filter(
        (event) => getEventStatus(event.startDate, event.endDate) === "upcoming",
      ).length,
      ongoing: safeEvents.filter(
        (event) => getEventStatus(event.startDate, event.endDate) === "ongoing",
      ).length,
      past: safeEvents.filter(
        (event) => getEventStatus(event.startDate, event.endDate) === "past",
      ).length,
    };
  }, [events]);

  const visibleEvents = useMemo(() => {
    const safeEvents = Array.isArray(events) ? events : [];
    if (activeTab === "all") {
      return safeEvents;
    }
    return safeEvents.filter(
      (event) => getEventStatus(event.startDate, event.endDate) === activeTab,
    );
  }, [activeTab, events]);

  if (currentRole && currentRole !== "farmer") {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="kk-page-surface">
      <div className="relative overflow-hidden border-b border-primary-100 dark:border-gray-800 bg-linear-to-br from-primary-100 via-primary-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(22,163,74,0.12),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(34,197,94,0.15),transparent_35%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <p className="inline-flex items-center rounded-full border border-primary-200/70 bg-white/80 dark:bg-gray-800/70 px-3 py-1 text-xs font-semibold tracking-wide text-primary-700 dark:text-primary-300">
            Farmer Programs and Workshops
          </p>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-gray-100">
            Events
          </h1>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-600 dark:text-gray-400">
            Discover government drives, training camps, and marketplace events designed to improve farming outcomes in your region.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-12">
        <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2 text-slate-700 dark:text-gray-200">
            <RiFilter3Line className="text-primary-600 dark:text-primary-400" size={18} />
            <h2 className="font-semibold">Filter Events</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="sm:col-span-2 xl:col-span-2 relative">
              <RiSearchLine
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search events"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="input-field rounded-xl pl-10"
              />
            </div>

            <select
              value={filters.zone}
              onChange={(e) => handleFilterChange("zone", e.target.value)}
              className="input-field rounded-xl"
            >
              <option value="">All Zones</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
              <option value="Central">Central</option>
            </select>

            <select
              value={filters.state}
              onChange={(e) => handleFilterChange("state", e.target.value)}
              className="input-field rounded-xl"
            >
              <option value="">All States</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Punjab">Punjab</option>
              <option value="Haryana">Haryana</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
            </select>

            <input
              type="text"
              placeholder="District"
              value={filters.district}
              onChange={(e) => handleFilterChange("district", e.target.value)}
              className="input-field rounded-xl"
            />

            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => handleFilterChange("fromDate", e.target.value)}
              className="input-field rounded-xl"
            />

            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => handleFilterChange("toDate", e.target.value)}
              className="input-field rounded-xl"
            />

            <div className="sm:col-span-2 xl:col-span-1 flex items-center gap-2 justify-end xl:justify-start">
              <button
                onClick={handleApplyFilters}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition-all duration-300"
              >
                Apply
              </button>
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-all duration-300"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 border-b border-slate-200 dark:border-gray-800">
          <div className="flex flex-wrap gap-6 text-sm">
            {[
              { key: "all", label: "All", count: tabCounts.all },
              {
                key: "upcoming",
                label: "Upcoming",
                count: tabCounts.upcoming,
              },
              { key: "ongoing", label: "Ongoing", count: tabCounts.ongoing },
              { key: "past", label: "Past", count: tabCounts.past },
            ].map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as EventTab)}
                  className={`relative py-3 font-medium transition-colors ${
                    active
                      ? "text-primary-700 dark:text-primary-300"
                      : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200"
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 rounded-full bg-slate-100 dark:bg-gray-800 px-2 py-0.5 text-xs">
                    {tab.count}
                  </span>
                  {active && (
                    <span className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-primary-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <RiLoader4Line className="text-primary-600 dark:text-primary-400 text-4xl animate-spin" />
            <span className="ml-3 text-slate-700 dark:text-gray-300">
              Loading events...
            </span>
          </div>
        )}

        {!loading && visibleEvents.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mb-8">
            {visibleEvents.map((event) => (
              <div
                key={event.id}
                className="group rounded-xl overflow-hidden border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-full h-48 bg-linear-to-br from-primary-200 to-primary-100 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                  <img
                    src={event.imageUrl || FALLBACK_EVENT_IMAGE}
                    alt={event.title}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_EVENT_IMAGE;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-gray-100 mb-2 line-clamp-1">
                    {event.title}
                  </h3>

                  <p className="text-slate-600 dark:text-gray-400 text-sm line-clamp-2 min-h-10 mb-4">
                    {event.description}
                  </p>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
                      <RiMapPinLine size={16} className="text-primary-600 dark:text-primary-400" />
                      <span className="line-clamp-1">{event.location || "Location TBA"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
                      <RiCalendarLine
                        size={16}
                        className="text-primary-600 dark:text-primary-400"
                      />
                      <span>
                        {formatDate(event.startDate)} - {formatDate(event.endDate)}
                      </span>
                    </div>
                  </div>

                  {event.zone && (
                    <span className="inline-flex items-center rounded-full bg-primary-100 dark:bg-primary-900/40 px-2.5 py-1 text-xs font-semibold text-primary-700 dark:text-primary-300">
                      {event.zone}
                    </span>
                  )}

                  <button className="mt-4 w-full inline-flex items-center justify-center gap-1 rounded-lg bg-primary-600 hover:bg-primary-700 text-white py-2.5 text-sm font-medium transition-all duration-300">
                    View Details
                    <RiArrowRightSLine size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && visibleEvents.length === 0 && (
          <div className="mt-8 flex flex-col items-center justify-center py-14 rounded-2xl border border-dashed border-slate-300 dark:border-gray-700 bg-white/60 dark:bg-gray-900/70">
            <RiCalendarLine className="text-4xl text-slate-400 dark:text-gray-500 mb-3" />
            <p className="text-slate-700 dark:text-gray-300 text-lg font-semibold">
              No events found
            </p>
            <p className="text-slate-500 dark:text-gray-500 text-sm mt-1">
              Try adjusting filters or switch tabs to see other events.
            </p>
          </div>
        )}

        {!loading && currentPage < totalPages - 1 && (
          <div className="flex justify-center">
            <button
              onClick={handleLoadMore}
              className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all duration-300"
            >
              Load More Events
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
