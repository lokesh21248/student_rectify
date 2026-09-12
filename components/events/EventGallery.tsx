"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventGalleryProps {
  images: Array<{
    id: string;
    url?: string;
    image_url?: string;
    caption?: string | null;
  }>;
}

export function EventGallery({ images }: EventGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Normalize images and filter out any invalid/empty URLs
  const validImages = (images || [])
    .map((img) => ({
      ...img,
      url: (img.url || img.image_url || "").trim(),
    }))
    .filter((img) => Boolean(img.url));

  if (validImages.length === 0) return null;

  function openLightbox(index: number) {
    setLightboxIndex(index);
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    setLightboxIndex(null);
    document.body.style.overflow = "";
  }

  function prev() {
    setLightboxIndex((i) => (i !== null ? (i - 1 + validImages.length) % validImages.length : null));
  }

  function next() {
    setLightboxIndex((i) => (i !== null ? (i + 1) % validImages.length : null));
  }

  return (
    <>
      {/* Masonry grid */}
      <div className="columns-2 sm:columns-3 gap-3 space-y-3">
        {validImages.map((img, index) => (
          <div
            key={img.id}
            className={cn(
              "break-inside-avoid rounded-xl overflow-hidden cursor-pointer",
              "ring-0 hover:ring-2 hover:ring-primary-400 transition-all"
            )}
            onClick={() => openLightbox(index)}
          >
            <div className="relative w-full">
              <Image
                src={img.url}
                alt={img.caption || `Gallery image ${index + 1}`}
                width={400}
                height={300}
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
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
              {lightboxIndex + 1} / {validImages.length}
            </div>

            {/* Prev */}
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Image */}
            <div
              className="relative max-w-4xl max-h-[80vh] w-full mx-16"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={validImages[lightboxIndex].url}
                alt={validImages[lightboxIndex].caption || "Gallery image"}
                width={1200}
                height={800}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
              {validImages[lightboxIndex].caption && (
                <p className="text-white/60 text-sm text-center mt-3">
                  {validImages[lightboxIndex].caption}
                </p>
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
