"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventGalleryProps {
  media: Array<{
    id: string;
    media_url?: string;
    url?: string; // fallback
    image_url?: string; // fallback
    thumbnail_url?: string | null;
    caption?: string | null;
    title?: string | null;
    description?: string | null;
    media_type?: string;
  }>;
}

export function EventGallery({ media }: EventGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Normalize media
  const validMedia = (media || [])
    .map((m) => ({
      ...m,
      url: (m.media_url || m.url || m.image_url || "").trim(),
      type: m.media_type === 'video' ? 'video' : 'photo',
    }))
    .filter((m) => Boolean(m.url));

  if (validMedia.length === 0) return null;

  function openLightbox(index: number) {
    setLightboxIndex(index);
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    setLightboxIndex(null);
    document.body.style.overflow = "";
  }

  function prev() {
    setLightboxIndex((i) => (i !== null ? (i - 1 + validMedia.length) % validMedia.length : null));
  }

  function next() {
    setLightboxIndex((i) => (i !== null ? (i + 1) % validMedia.length : null));
  }

  const renderMediaContent = (item: any, isLightbox = false) => {
    if (item.type === 'video') {
      const isYouTube = item.url.includes("youtube.com") || item.url.includes("youtu.be");
      const isVimeo = item.url.includes("vimeo.com");

      if (isLightbox) {
        if (isYouTube) {
          const videoId = item.url.includes("youtu.be/") 
            ? item.url.split("youtu.be/")[1]?.split("?")[0]
            : item.url.split("v=")[1]?.split("&")[0];
          return (
            <iframe 
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              className="w-full h-full min-h-[50vh] sm:min-h-[70vh] rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            />
          );
        }
        if (isVimeo) {
          const videoId = item.url.split("vimeo.com/")[1];
          return (
            <iframe 
              src={`https://player.vimeo.com/video/${videoId}?autoplay=1`}
              className="w-full h-full min-h-[50vh] sm:min-h-[70vh] rounded-lg"
              allow="autoplay; fullscreen; picture-in-picture" 
              allowFullScreen
            />
          );
        }
        // Direct video (mp4, webm)
        return (
          <video 
            src={item.url} 
            controls 
            autoPlay 
            className="w-full h-auto max-h-[80vh] rounded-lg object-contain"
          />
        );
      } else {
        // Thumbnail view for videos
        return (
          <div className="relative w-full aspect-video bg-slate-900 rounded-lg overflow-hidden group">
            {item.thumbnail_url ? (
              <Image src={item.thumbnail_url} alt={item.title || "Video"} fill className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                <span className="text-slate-500 text-xs">Video</span>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white shadow-lg group-hover:bg-white/30 transition-colors">
                <Play className="w-5 h-5 ml-1" fill="currentColor" />
              </div>
            </div>
          </div>
        );
      }
    }

    // Default to photo
    if (isLightbox) {
      return (
        <Image
          src={item.url}
          alt={item.title || item.caption || "Gallery image"}
          width={1200}
          height={800}
          className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
        />
      );
    }
    
    return (
      <div className="relative w-full">
        <Image
          src={item.url}
          alt={item.title || item.caption || "Gallery image"}
          width={400}
          height={300}
          className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300 rounded-lg"
        />
      </div>
    );
  };

  return (
    <>
      {/* Masonry grid */}
      <div className="columns-2 sm:columns-3 gap-3 space-y-3">
        {validMedia.map((m, index) => (
          <div
            key={m.id}
            className={cn(
              "break-inside-avoid rounded-xl overflow-hidden cursor-pointer",
              "ring-0 hover:ring-2 hover:ring-primary-400 transition-all"
            )}
            onClick={() => openLightbox(index)}
          >
            {renderMediaContent(m, false)}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
              {lightboxIndex + 1} / {validMedia.length}
            </div>

            {/* Prev */}
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Content */}
            <div
              className="relative max-w-5xl w-full mx-16 flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {renderMediaContent(validMedia[lightboxIndex], true)}
              
              {(validMedia[lightboxIndex].caption || validMedia[lightboxIndex].title || validMedia[lightboxIndex].description) && (
                <div className="mt-4 max-w-2xl text-center">
                  {(validMedia[lightboxIndex].title || validMedia[lightboxIndex].caption) && (
                    <h3 className="text-white font-medium mb-1">
                      {validMedia[lightboxIndex].title || validMedia[lightboxIndex].caption}
                    </h3>
                  )}
                  {validMedia[lightboxIndex].description && (
                    <p className="text-white/60 text-sm">
                      {validMedia[lightboxIndex].description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Next */}
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
