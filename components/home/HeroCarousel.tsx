"use client";

import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { EventWithStatus } from "@/types";
import { formatDate, formatTime, formatCount } from "@/lib/utils";
import { LiveBadge } from "@/components/events/LiveBadge";
import { cn } from "@/lib/utils";

// MUI Imports
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";

interface HeroCarouselProps {
  events: EventWithStatus[];
}

export function HeroCarousel({ events }: HeroCarouselProps) {
  const theme = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: true }),
  ]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!events.length) return null;

  return (
    <div className="relative rounded-[24px] overflow-hidden bg-slate-900 border border-slate-800 shadow-xl group">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex touch-pan-y">
          {events.map((event, index) => (
            <HeroSlide key={event.id} event={event} isActive={index === selectedIndex} theme={theme} />
          ))}
        </div>
      </div>

      {/* Navigation arrows (desktop) */}
      {events.length > 1 && (
        <>
          <IconButton
            onClick={scrollPrev}
            sx={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "white",
              opacity: 0,
              transition: "all 0.3s ease",
              ".group:hover &": { opacity: 1 },
              "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.6)" },
              zIndex: 20,
            }}
            aria-label="Previous event"
          >
            <ChevronLeft size={20} />
          </IconButton>
          <IconButton
            onClick={scrollNext}
            sx={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "white",
              opacity: 0,
              transition: "all 0.3s ease",
              ".group:hover &": { opacity: 1 },
              "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.6)" },
              zIndex: 20,
            }}
            aria-label="Next event"
          >
            <ChevronRight size={20} />
          </IconButton>
        </>
      )}

      {/* Pagination dots */}
      {events.length > 1 && (
        <div className="absolute bottom-5 right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 z-20 shadow-md">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={cn(
                "rounded-full transition-all duration-300 cursor-pointer",
                index === selectedIndex
                  ? "w-6 h-2 shadow-sm"
                  : "w-2 h-2 bg-white/40 hover:bg-white/70"
              )}
              style={index === selectedIndex ? { backgroundColor: theme.palette.primary.main } : {}}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HeroSlide({ event, isActive, theme }: { event: EventWithStatus; isActive: boolean; theme: any }) {
  const isLive = event.computed_status === "LIVE";

  return (
    <div className="relative flex-[0_0_100%] min-w-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-8 md:p-10">
        {/* Left Column: Text & CTAs */}
        <div className="lg:col-span-7 flex flex-col justify-center order-1">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            {event.category_name && (
              <Chip 
                label={event.category_name} 
                size="small"
                sx={{
                  backgroundColor: "rgba(59, 130, 246, 0.25)",
                  color: "#bfdbfe", // blue-200
                  border: "1px solid rgba(96, 165, 250, 0.3)",
                  backdropFilter: "blur(12px)",
                  fontWeight: 600,
                  borderRadius: "8px",
                }}
              />
            )}
            {isLive && <LiveBadge />}
          </div>

          {/* Event Title */}
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              color: "white", 
              fontWeight: 800, 
              mb: 1.5,
              fontSize: { xs: "1.5rem", sm: "1.875rem", lg: "2.25rem" },
              lineHeight: 1.2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden"
            }}
          >
            {event.title}
          </Typography>

          {/* Description */}
          {event.short_description && (
            <Typography 
              variant="body1" 
              sx={{ 
                color: "rgba(255,255,255,0.7)", 
                mb: 2.5,
                maxWidth: "600px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              }}
            >
              {event.short_description}
            </Typography>
          )}

          {/* Metadata Pills */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-6 text-xs text-white/90">
            {event.college_name && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                <span className="font-semibold text-white truncate max-w-[200px]">{event.college_name}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <Calendar className="w-3.5 h-3.5" style={{ color: theme.palette.primary.light }} />
              <span suppressHydrationWarning>{formatDate(event.start_at)} · {formatTime(event.start_at)}</span>
            </div>
            {event.venue && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate max-w-[180px]">{event.venue}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>{formatCount(event.registration_count)} registered</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 w-full mt-2">
            <Button
              component={Link}
              href={`/events/${event.slug}`}
              variant="contained"
              size="large"
              sx={{
                width: { xs: "100%", sm: "auto" },
                borderRadius: "12px",
                px: 3,
                py: 1.25,
                fontWeight: 600,
                boxShadow: `0 8px 16px -4px ${theme.palette.primary.main}40`,
              }}
            >
              Register Now
            </Button>
            <Button
              component={Link}
              href={`/events/${event.slug}`}
              variant="outlined"
              size="large"
              endIcon={<ArrowRight size={16} />}
              sx={{
                width: { xs: "100%", sm: "auto" },
                borderRadius: "12px",
                px: 3,
                py: 1.25,
                fontWeight: 600,
                color: "white",
                borderColor: "rgba(255,255,255,0.2)",
                backgroundColor: "rgba(255,255,255,0.1)",
                "&:hover": {
                  borderColor: "rgba(255,255,255,0.4)",
                  backgroundColor: "rgba(255,255,255,0.2)",
                }
              }}
            >
              View Details
            </Button>
          </div>
        </div>

        {/* Right Column: Visual in 16:7 / 16:9 Aspect Ratio with Object-Cover */}
        <div className="lg:col-span-5 flex items-center justify-center order-2">
          <div className="relative w-full aspect-[16/9] lg:aspect-[16/11] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-800">
            {event.banner_url ? (
              <Image
                src={event.banner_url}
                alt={event.title}
                fill
                className="object-cover"
                priority={isActive}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${event.category_color || theme.palette.primary.main}40, #0f172a)`,
                }}
              >
                <span className="text-5xl opacity-40">🎓</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            
            {/* View Gallery Overlay Button */}
            {event.gallery_media_count > 0 && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <Link
                  href={`/events/${event.slug}#gallery`}
                  className="pointer-events-auto inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold rounded-full border border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all transform hover:scale-105 active:scale-95"
                >
                  <span>View Gallery ({event.gallery_media_count})</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

