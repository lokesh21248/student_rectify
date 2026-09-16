"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Image as ImageIcon, Play, Calendar, MapPin, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Gallery, GalleryMedia } from "@/types";
import { formatDate } from "@/lib/utils";

interface GalleryClientProps {
  galleries: Gallery[];
}

export function GalleryClient({ galleries }: GalleryClientProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "photos" | "videos">("all");
  const [filterCollege, setFilterCollege] = useState("all");
  
  // Get unique colleges for the filter
  const colleges = useMemo(() => {
    const unique = new Set<string>();
    galleries.forEach(g => {
      if (g.college_id && g.colleges?.name) {
        unique.add(g.colleges.name);
      }
    });
    return Array.from(unique);
  }, [galleries]);

  const filteredGalleries = useMemo(() => {
    return galleries.filter(g => {
      // Type filter (assuming gallery has these counts or we approximate based on if they have any)
      if (filterType === "photos" && !(g.photo_count && g.photo_count > 0)) return false;
      if (filterType === "videos" && !(g.video_count && g.video_count > 0)) return false;
      
      // College filter
      if (filterCollege !== "all" && g.colleges?.name !== filterCollege) return false;
      
      // Search
      if (search) {
        const query = search.toLowerCase();
        const matchesName = g.name.toLowerCase().includes(query);
        const matchesEvent = g.events?.title?.toLowerCase().includes(query);
        const matchesCollege = g.colleges?.name?.toLowerCase().includes(query);
        return matchesName || matchesEvent || matchesCollege;
      }
      
      return true;
    });
  }, [galleries, search, filterType, filterCollege]);

  return (
    <div className="page-enter pb-16">
      <div className="container-page pt-8 sm:pt-12 pb-8">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Event Gallery
          </h1>
          <p className="text-slate-500 text-sm sm:text-base">
            Moments from college events, competitions, workshops, and celebrations across the country.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <div className="flex bg-slate-100 p-1 rounded-xl self-stretch md:self-auto">
            <button 
              onClick={() => setFilterType("all")}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${filterType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilterType("photos")}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${filterType === 'photos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Photos
            </button>
            <button 
              onClick={() => setFilterType("videos")}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${filterType === 'videos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Videos
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search gallery..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            
            <select
              value={filterCollege}
              onChange={(e) => setFilterCollege(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 font-medium text-slate-700"
            >
              <option value="all">All Colleges</option>
              {colleges.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid */}
        {filteredGalleries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGalleries.map((gallery) => (
              <Link 
                href={`/events/${gallery.events?.slug}#gallery`} 
                key={gallery.id}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  {gallery.cover_image_url ? (
                    <Image 
                      src={gallery.cover_image_url} 
                      alt={gallery.name} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500" 
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80" />
                  
                  {/* Media Type Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {gallery.photo_count ? (
                      <div className="px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[10px] font-bold text-white border border-white/20 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> {gallery.photo_count}
                      </div>
                    ) : null}
                    {gallery.video_count ? (
                      <div className="px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[10px] font-bold text-white border border-white/20 flex items-center gap-1">
                        <Play className="w-3 h-3" fill="currentColor" /> {gallery.video_count}
                      </div>
                    ) : null}
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-900 text-base leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {gallery.name}
                  </h3>
                  
                  <div className="mt-auto space-y-1.5">
                    {gallery.events?.title && (
                      <p className="text-xs text-blue-600 font-medium truncate">
                        {gallery.events.title}
                      </p>
                    )}
                    {gallery.colleges?.name && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{gallery.colleges.name}</span>
                      </div>
                    )}
                    {gallery.gallery_date && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span suppressHydrationWarning>{formatDate(gallery.gallery_date, "MMMM d, yyyy")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-slate-900 font-bold mb-1">No galleries found</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              We couldn't find any galleries matching your search or filter criteria.
            </p>
            {(search || filterType !== "all" || filterCollege !== "all") && (
              <button 
                onClick={() => { setSearch(""); setFilterType("all"); setFilterCollege("all"); }}
                className="mt-4 px-4 py-2 bg-white text-blue-600 text-sm font-semibold rounded-lg shadow-sm border border-slate-200"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
