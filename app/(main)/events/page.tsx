import type { Metadata } from "next";
import { Suspense } from "react";
import { EventsContent } from "./EventsContent";
import { getCategories, getEvents } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Explore Events",
  description:
    "Discover hackathons, workshops, seminars, cultural fests and more college events. Filter by category, college, date, and status.",
};

interface EventsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    subcategory?: string;
    college?: string;
    mode?: string;
    status?: string;
    sort?: string;
    page?: string;
    view?: string;
  }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const [categories, initialEventsData] = await Promise.all([
    getCategories(),
    getEvents({
      search: params.search,
      category: params.category,
      subcategory: params.subcategory,
      college: params.college,
      mode: params.mode as any,
      status: params.status as any,
      sort: (params.sort as any) || "newest",
      page: parseInt(params.page || "1"),
      limit: 12,
    }),
  ]);

  return (
    <div className="container-page py-8 page-enter">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Explore Events</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Find the perfect event to grow, learn, and connect.
        </p>
      </div>
      <Suspense fallback={<EventsPageSkeleton />}>
        <EventsContent
          searchParams={params}
          categories={categories}
          initialEvents={initialEventsData.data}
          initialTotal={initialEventsData.total}
          initialHasMore={initialEventsData.hasMore}
        />
      </Suspense>
    </div>
  );
}

function EventsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-12 rounded-xl w-full" />
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-9 w-24 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton aspect-[4/3] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
