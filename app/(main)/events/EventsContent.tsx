"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search, SlidersHorizontal, X, ChevronDown, Grid2X2, List,
} from "lucide-react";
import { EventCard } from "@/components/events/EventCard";
import { EventCardSkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Category, EventWithStatus, EventFilters } from "@/types";
import { cn } from "@/lib/utils";

interface EventsContentProps {
  searchParams: {
    search?: string;
    category?: string;
    subcategory?: string;
    college?: string;
    mode?: string;
    status?: string;
    sort?: string;
    page?: string;
  };
  categories: Category[];
  initialEvents?: EventWithStatus[];
  initialTotal?: number;
  initialHasMore?: boolean;
}

const statusOptions = [
  { label: "All", value: "" },
  { label: "Live Now", value: "live" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Completed", value: "completed" },
];

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "By Date", value: "date" },
  { label: "Popular", value: "popular" },
];

const modeOptions = [
  { label: "All Modes", value: "" },
  { label: "Online", value: "online" },
  { label: "Offline", value: "offline" },
  { label: "Hybrid", value: "hybrid" },
];

export function EventsContent({
  searchParams,
  categories,
  initialEvents = [],
  initialTotal = 0,
  initialHasMore = false,
}: EventsContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.search || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [events, setEvents] = useState<EventWithStatus[]>(initialEvents);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(parseInt(searchParams.page || "1"));
  const [hasMore, setHasMore] = useState(initialHasMore);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Load events
  useEffect(() => {
    const isDefaultInitial =
      page === 1 &&
      !debouncedSearch &&
      !searchParams.category &&
      !searchParams.mode &&
      !searchParams.status &&
      !searchParams.sort;

    if (isDefaultInitial && initialEvents.length > 0) {
      setEvents(initialEvents);
      setTotal(initialTotal);
      setHasMore(initialHasMore);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (searchParams.category) params.set("category", searchParams.category);
    if (searchParams.subcategory) params.set("subcategory", searchParams.subcategory);
    if (searchParams.college) params.set("college", searchParams.college);
    if (searchParams.mode) params.set("mode", searchParams.mode);
    if (searchParams.status) params.set("status", searchParams.status);
    if (searchParams.sort) params.set("sort", searchParams.sort);
    params.set("page", page.toString());
    params.set("limit", "12");

    fetch(`/api/events?${params.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          if (page === 1) {
            setEvents(res.data);
          } else {
            setEvents((prev) => [...prev, ...res.data]);
          }
          setTotal(res.total ?? 0);
          setHasMore(res.hasMore ?? false);
        }
      })
      .catch((err) => console.error("Error fetching events:", err))
      .finally(() => setLoading(false));
  }, [
    debouncedSearch,
    searchParams.category,
    searchParams.subcategory,
    searchParams.college,
    searchParams.mode,
    searchParams.status,
    searchParams.sort,
    page,
  ]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, searchParams.category, searchParams.mode, searchParams.status, searchParams.sort]);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      startTransition(() => {
        const params = new URLSearchParams(window.location.search);
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname]
  );

  const clearAllFilters = () => {
    setSearch("");
    router.push(pathname);
  };

  const activeFilterCount = [
    searchParams.category,
    searchParams.mode,
    searchParams.status,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Search bar with guaranteed left padding */}
      <div className="relative">
        <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          id="event-search"
          placeholder="Search events, colleges, organizers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: "48px", paddingRight: "44px" }}
          className="w-full h-12 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs transition"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Control Bar: Segmented Status Tabs (Left) + Dropdown Selects & Counter (Right) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 pb-2">
        {/* Status segmented pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit flex-wrap">
          {statusOptions.map((opt) => {
            const isSelected = searchParams.status === opt.value || (!searchParams.status && !opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => updateFilter("status", opt.value)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none",
                  isSelected
                    ? "bg-white text-blue-600 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Right side: Category, Mode, Sort dropdowns + count */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Category filter */}
          <div className="relative">
            <select
              value={searchParams.category || ""}
              onChange={(e) => updateFilter("category", e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Mode filter */}
          <div className="relative">
            <select
              value={searchParams.mode || ""}
              onChange={(e) => updateFilter("mode", e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all"
            >
              {modeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={searchParams.sort || "newest"}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Sort: {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Clear filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Reset ({activeFilterCount})
            </button>
          )}

          <span className="text-xs font-semibold text-slate-400 ml-1">
            {loading ? "Loading…" : `${total.toLocaleString()} ${total === 1 ? "event" : "events"}`}
          </span>
        </div>
      </div>

      {/* Events grid */}
      {loading && page === 1 ? (
        <EventCardSkeletonGrid count={12} />
      ) : events.length === 0 ? (
        <EmptyState
          type="no-results"
          action={{ label: "Clear filters", onClick: clearAllFilters }}
        />
      ) : (
        <>
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {events.map((event) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </motion.div>

          {/* Load more */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-60"
              >
                {loading ? "Loading…" : "Load more events"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
