import Link from "next/link";
import { ArrowRight, Zap, Award, Search, Compass, BookOpen, QrCode, Plus } from "lucide-react";
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
      {/* ── MOBILE: Evently Top Layout ──────────────────────────────────────── */}
      <section className="md:hidden container-page pt-4 pb-6 space-y-6">
        {/* Mobile Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search events, colleges..."
            className="w-full bg-slate-100 border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-shadow outline-none text-slate-900"
          />
        </div>

        {/* Mobile Hero Card */}
        <div className="relative rounded-[20px] overflow-hidden bg-[#0A192F] p-6 text-white shadow-lg">
          <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-blue-600/30 to-purple-600/30" />
          <div className="relative z-10">
            <h2 className="text-[22px] font-extrabold leading-tight mb-2">
              COLLEGE EVENTS<br />MAKE BIGGER STORIES
            </h2>
            <p className="text-white/70 text-xs mb-5">
              Learn. Participate. Connect. Grow.
            </p>
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors text-xs"
            >
              <span>Explore Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="font-bold text-slate-900 mb-3 text-sm tracking-tight">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Compass, label: "Find\nEvents", color: "text-blue-500", bg: "bg-blue-50", href: "/events" },
              { icon: Award, label: "Get\nCertificates", color: "text-purple-500", bg: "bg-purple-50", href: "/certificates" },
              { icon: QrCode, label: "QR\nCheck-in", color: "text-slate-600", bg: "bg-slate-100", href: "/my-events" },
              { icon: Plus, label: "Create\nEvent", color: "text-emerald-500", bg: "bg-emerald-50", href: "/admin" },
            ].map((action, i) => (
              <Link key={i} href={action.href} className="flex flex-col items-center gap-1.5 text-center group">
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-105", action.bg, action.color)}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-slate-600 leading-tight whitespace-pre-line">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── DESKTOP: Hero ───────────────────────────────────────────────────────── */}
      <section className="hidden md:block container-page pt-6 sm:pt-8 pb-10 sm:pb-12">
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
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 hide-scrollbar">
            {liveEvents.map((event) => (
              <div key={event.id} className="w-[85vw] sm:w-auto shrink-0 snap-center">
                <EventCard event={event} />
              </div>
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
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 hide-scrollbar">
            {upcomingEvents.slice(0, 6).map((event) => (
              <div key={event.id} className="w-[85vw] sm:w-auto shrink-0 snap-center">
                <EventCard event={event} />
              </div>
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
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 hide-scrollbar">
            {latestEvents.slice(0, 6).map((event) => (
              <div key={event.id} className="w-[85vw] sm:w-auto shrink-0 snap-center">
                <EventCard event={event} />
              </div>
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
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 hide-scrollbar">
            {completedEvents.map((event) => (
              <div key={event.id} className="w-[85vw] sm:w-auto shrink-0 snap-center">
                <EventCard event={event} />
              </div>
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
