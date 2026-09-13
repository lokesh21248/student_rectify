import type { Metadata } from "next";
import Link from "next/link";
import { Building2, MapPin, Globe, ExternalLink, Search } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Partner Colleges",
  description:
    "Explore our network of partner colleges and universities hosting events on EduEvents across India.",
};

async function getColleges() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("colleges")
      .select("id, name, slug, logo_url, city, state, country, institution_type, description, website, status, cover_url")
      .eq("status", "active")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export default async function CollegesPage() {
  const colleges = await getColleges();

  return (
    <div className="page-enter pb-16">
      {/* Header */}
      <section className="bg-white border-b border-slate-100">
        <div className="container-page py-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4">
              <Building2 className="w-3.5 h-3.5" />
              PARTNER NETWORK
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
              Our Partner Colleges
            </h1>
            <p className="text-slate-500 text-base leading-relaxed">
              EduEvents partners with leading universities and colleges across India to bring you
              verified, high-quality events from top academic institutions.
            </p>
          </div>
        </div>
      </section>

      {/* Colleges Grid */}
      <section className="container-page py-12">
        {colleges.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-700 mb-2">No partner colleges yet</h2>
            <p className="text-slate-400 text-sm">
              We're actively onboarding universities. Check back soon.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-6">{colleges.length} partner institution{colleges.length !== 1 ? "s" : ""}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {colleges.map((college: any) => (
                <div
                  key={college.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-blue-200 hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  {/* Cover / logo area */}
                  <div className="relative h-32 bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center overflow-hidden">
                    {college.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={college.cover_url}
                        alt={college.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-12 h-12 text-slate-300" />
                    )}
                    {college.logo_url && (
                      <div className="absolute bottom-3 left-4 w-12 h-12 rounded-xl bg-white border border-slate-200 shadow flex items-center justify-center overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={college.logo_url}
                          alt={`${college.name} logo`}
                          className="w-10 h-10 object-contain"
                        />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <h2 className="font-bold text-slate-900 text-base leading-snug mb-1">{college.name}</h2>
                    {college.institution_type && (
                      <span className="text-xs text-blue-600 font-semibold mb-2">{college.institution_type}</span>
                    )}
                    {(college.city || college.state) && (
                      <div className="flex items-center gap-1 text-slate-400 text-xs mb-3">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{[college.city, college.state].filter(Boolean).join(", ")}</span>
                      </div>
                    )}
                    {college.description && (
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                        {college.description}
                      </p>
                    )}
                    <div className="mt-auto flex items-center gap-3">
                      <Link
                        href={`/events?college=${college.slug}`}
                        className="flex-1 text-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors"
                      >
                        View Events
                      </Link>
                      {college.website && (
                        <a
                          href={college.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors"
                          aria-label="Visit website"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* CTA for organizers */}
      <section className="container-page py-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 sm:p-10 text-white text-center">
          <Building2 className="w-10 h-10 mx-auto mb-4 opacity-80" />
          <h2 className="text-xl sm:text-2xl font-bold mb-3">Is your college not listed?</h2>
          <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">
            Partner with EduEvents to reach thousands of students across India and make your events more impactful.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-md"
          >
            <Globe className="w-4 h-4" />
            Contact Us to Partner
          </Link>
        </div>
      </section>
    </div>
  );
}
