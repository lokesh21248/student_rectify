import Link from "next/link";
import { ArrowRight, Zap, Award } from "lucide-react";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryGrid } from "@/components/home/CategoryCard";
import { EventCard } from "@/components/events/EventCard";
import { cn } from "@/lib/utils";
import {
  getFeaturedEvents,
  getLiveEvents,
  getUpcomingEvents,
  getLatestEvents,
  getCompletedEvents,
  getCategories,
} from "@/lib/supabase/queries";

export default async function HomePage() {
  const [
    featuredEvents,
    liveEvents,
    upcomingEvents,
    latestEvents,
    completedEvents,
    categories,
  ] = await Promise.all([
    getFeaturedEvents(),
    getLiveEvents(),
    getUpcomingEvents(6),
    getLatestEvents(6),
    getCompletedEvents(6),
    getCategories(),
  ]);

  return (
    <div className="page-enter pb-16">
      {/* ── 1. Hero ───────────────────────────────────────────────────────── */}
      <section className="container-page pt-6 sm:pt-8 pb-10 sm:pb-12">
        {featuredEvents.length > 0 ? (
          <HeroCarousel events={featuredEvents} />
        ) : (
          <div className="relative rounded-[24px] overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 p-8 sm:p-12 text-center text-white">
            <h1 className="heading-1 mb-4">Discover College Events</h1>
            <p className="text-white/80 text-sm sm:text-base mb-6 max-w-lg mx-auto">
              Find hackathons, workshops, seminars, and more from leading colleges across India.
            </p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm shadow-md"
            >
              <span>Explore Events</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>

      {/* ── 2. Live Now ───────────────────────────────────────────────────── */}
      {liveEvents.length > 0 && (
        <section className="container-page py-10 sm:py-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 live-dot shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Live Now</h2>
                  <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-semibold rounded-md border border-red-100">
                    {liveEvents.length}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Events happening right now</p>
              </div>
            </div>
            <Link href="/events?status=live" className="btn-ghost text-xs sm:text-sm">
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className={cn(
            "grid gap-5 sm:gap-6",
            liveEvents.length === 1
              ? "grid-cols-1 max-w-lg"
              : liveEvents.length === 2
              ? "grid-cols-1 sm:grid-cols-2 max-w-3xl"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          )}>
            {liveEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* ── 3. Categories ─────────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="container-page py-10 sm:py-12">
          <CategoryGrid categories={categories} />
        </section>
      )}

      {/* ── 4. Upcoming Events ────────────────────────────────────────────── */}
      {upcomingEvents.length > 0 && (
        <section className="container-page py-10 sm:py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Upcoming Events</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Register before registrations close or seats fill up</p>
            </div>
            <Link href="/events?status=upcoming" className="btn-ghost text-xs sm:text-sm">
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className={cn(
            "grid gap-5 sm:gap-6",
            upcomingEvents.length === 1
              ? "grid-cols-1 max-w-lg"
              : upcomingEvents.length === 2
              ? "grid-cols-1 sm:grid-cols-2 max-w-3xl"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          )}>
            {upcomingEvents.slice(0, 6).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* ── 5. Latest Events ──────────────────────────────────────────────── */}
      {latestEvents.length > 0 && (
        <section className="container-page py-10 sm:py-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Latest Events</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Recently announced competitions and gatherings</p>
              </div>
            </div>
            <Link href="/events?sort=newest" className="btn-ghost text-xs sm:text-sm">
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className={cn(
            "grid gap-5 sm:gap-6",
            latestEvents.length === 1
              ? "grid-cols-1 max-w-lg"
              : latestEvents.length === 2
              ? "grid-cols-1 sm:grid-cols-2 max-w-3xl"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          )}>
            {latestEvents.slice(0, 6).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* ── 6. Past Events ────────────────────────────────────────────────── */}
      {completedEvents.length > 0 && (
        <section className="container-page py-10 sm:py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Past Events</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Browse previous event galleries and winner results</p>
            </div>
            <Link href="/events?status=completed" className="btn-ghost text-xs sm:text-sm">
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className={cn(
            "grid gap-5 sm:gap-6",
            completedEvents.length === 1
              ? "grid-cols-1 max-w-lg"
              : completedEvents.length === 2
              ? "grid-cols-1 sm:grid-cols-2 max-w-3xl"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          )}>
            {completedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* ── 7. CTA Banner ─────────────────────────────────────────────────── */}
      <section className="container-page pt-4 pb-16 sm:pb-20">
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-6 sm:px-10 py-12 sm:py-16 text-center shadow-xl">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/15 backdrop-blur-md rounded-full text-white text-xs font-semibold mb-4 border border-white/20">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Earn Verified Certificates</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
              Participate. Attend. Achieve.
            </h2>
            <p className="text-white/85 text-sm sm:text-base leading-relaxed mb-8 max-w-lg mx-auto">
              Register for events, attend with your seamless QR code pass, and receive an authentic verified certificate to showcase on LinkedIn.
            </p>
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
              <Link
                href="/events"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-slate-50 transition-all text-sm shadow-md active:scale-95"
              >
                <span>Explore Events</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/verify/check"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold rounded-xl transition-all text-sm active:scale-95"
              >
                <span>Verify Certificate</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
