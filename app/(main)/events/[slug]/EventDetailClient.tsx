"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Calendar, MapPin, Users, Heart, Share2, Clock, CheckCircle2,
  Award, ExternalLink, Wifi, QrCode, ArrowLeft, ChevronDown,
  ChevronUp, Image as ImageIcon, Trophy,
} from "lucide-react";
import { LiveBadge, StatusBadge } from "@/components/events/LiveBadge";
import { CountdownTimer } from "@/components/events/CountdownTimer";
import { QRDisplay } from "@/components/events/QRDisplay";
import { EventGallery } from "@/components/events/EventGallery";
import { formatDate, formatTime, formatCount, getCapacityPercent } from "@/lib/utils";

interface EventDetailClientProps {
  event: any;
  isRegistered: boolean;
  isInterested: boolean;
  registrationData: any;
  userId: string | null;
}

export function EventDetailClient({
  event,
  isRegistered: initialIsRegistered,
  isInterested: initialIsInterested,
  registrationData: initialRegistrationData,
  userId,
}: EventDetailClientProps) {
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(initialIsRegistered);
  const [isInterested, setIsInterested] = useState(initialIsInterested);
  const [registrationData, setRegistrationData] = useState(initialRegistrationData);
  const [registrationCount, setRegistrationCount] = useState(event.registration_count);
  const [interestCount, setInterestCount] = useState(event.interest_count);
  const [loading, setLoading] = useState<"register" | "interest" | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [showSchedule, setShowSchedule] = useState(true);

  const status = event.computed_status;
  const isLive = status === "LIVE";
  const isUpcoming = status === "UPCOMING";
  const isCompleted = status === "COMPLETED";
  const registrationOpen = isUpcoming &&
    (!event.registration_deadline || new Date(event.registration_deadline) > new Date()) &&
    (!event.max_participants || registrationCount < event.max_participants);

  const capacityPct = getCapacityPercent(registrationCount, event.max_participants);

  // Registration form modal state
  const [showRegModal, setShowRegModal] = useState(false);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCollege, setRegCollege] = useState("");

  // Register / Cancel
  function handleRegister() {
    if (isRegistered) {
      if (!confirm("Are you sure you want to cancel your registration?")) return;
      setIsRegistered(false);
      setRegistrationData(null);
      setRegistrationCount((c: number) => Math.max(0, c - 1));
      toast.success("Registration cancelled");
    } else {
      setShowRegModal(true);
    }
  }

  async function handleCompleteRegistration(e: React.FormEvent) {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      toast.error("Please enter your name and email");
      return;
    }

    setLoading("register");
    try {
      const res = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          college_name: regCollege,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setIsRegistered(true);
      setRegistrationData(data.registration);
      setRegistrationCount((c: number) => c + 1);
      setShowRegModal(false);
      setShowQR(true);
      toast.success(data.message || "Registration confirmed!", {
        description: `Pass Number: ${data.registration.registration_number}`,
      });
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(null);
    }
  }

  // Interest toggle
  async function handleInterest() {
    const previousState = isInterested;
    const next = !isInterested;
    setIsInterested(next);
    setInterestCount((c: number) => c + (next ? 1 : -1));
    
    try {
      const res = await fetch(`/api/events/${event.id}/interest`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to update interest");
      toast.success(next ? "Marked as interested!" : "Removed from interested");
    } catch (err) {
      setIsInterested(previousState);
      setInterestCount((c: number) => c + (previousState ? 1 : -1));
      toast.error("Unable to update interest. Please try again.");
    }
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: event.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  }

  return (
    <div className="page-enter">
      {/* Back button */}
      <div className="container-page pt-5 pb-3">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Events</span>
        </button>
      </div>

      {/* Hero image */}
      <div className="container-page pb-0">
        <div className="relative rounded-2xl overflow-hidden aspect-[16/6] md:aspect-[16/5] bg-slate-100">
          {event.banner_url ? (
            <Image src={event.banner_url} alt={event.title} fill className="object-cover" priority sizes="100vw" />
          ) : (
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${event.category_color || "#6366f1"}30, #0f172a)` }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            {event.category_name && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white border border-white/20 bg-white/10 backdrop-blur-sm">
                {event.category_name}
              </span>
            )}
            {isLive && <LiveBadge />}
            {!isLive && <StatusBadge status={status} />}
          </div>
        </div>
      </div>

      <div className="container-page py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & meta */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 leading-tight">
                {event.title}
              </h1>
              {event.college_name && (
                <p className="text-blue-600 font-medium mb-3">{event.college_name}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(event.start_at, "EEEE, MMM d, yyyy")}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {formatTime(event.start_at)} – {formatTime(event.end_at)}
                </span>
                {event.venue && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {event.venue}
                  </span>
                )}
                {event.mode === "online" && (
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <Wifi className="w-4 h-4" />
                    Online Event
                  </span>
                )}
              </div>
            </div>

            {/* Countdown */}
            {isUpcoming && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">Starts In</p>
                <CountdownTimer targetDate={event.start_at} />
              </div>
            )}
            {isLive && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <LiveBadge size="md" />
                  <span className="text-sm text-red-700 font-medium">Event is happening now!</span>
                </div>
                <CountdownTimer targetDate={event.end_at} label="Ends in" />
              </div>
            )}
            {isCompleted && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-800">Event Completed</p>
                  <p className="text-sm text-emerald-600">This event has concluded on {formatDate(event.end_at)}.</p>
                </div>
              </div>
            )}

            {/* About */}
            {event.description && (
              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-3">About This Event</h2>
                <div className="prose prose-slate prose-sm max-w-none">
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">{event.description}</p>
                </div>
              </section>
            )}

            {/* Schedule */}
            {event.schedule?.length > 0 && (
              <section>
                <button
                  onClick={() => setShowSchedule(!showSchedule)}
                  className="flex items-center justify-between w-full mb-4"
                >
                  <h2 className="text-lg font-bold text-slate-900">Event Schedule</h2>
                  {showSchedule ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                <AnimatePresence>
                  {showSchedule && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="relative pl-6 border-l-2 border-slate-100 space-y-4">
                        {event.schedule.map((item: any, i: number) => (
                          <div key={item.id} className="relative">
                            <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-primary-500 border-2 border-white" />
                            <div className="bg-slate-50 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-slate-900 text-sm">{item.title}</p>
                                <span className="text-xs text-slate-500">{formatTime(item.starts_at)}</span>
                              </div>
                              {item.description && (
                                <p className="text-xs text-slate-500">{item.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            )}

            {/* Eligibility & Rules */}
            {(event.eligibility || event.rules) && (
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {event.eligibility && (
                  <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-5 shadow-xs">
                    <h3 className="font-bold text-slate-900 mb-2 text-sm">Eligibility</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{event.eligibility}</p>
                  </div>
                )}
                {event.rules && (
                  <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-5 shadow-xs">
                    <h3 className="font-bold text-slate-900 mb-2 text-sm">Rules & Guidelines</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{event.rules}</p>
                  </div>
                )}
              </section>
            )}

            {/* Prize */}
            {event.prize_info && (
              <section className="bg-amber-50/80 border border-amber-200/70 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-amber-900 text-sm">Prize Information</h3>
                </div>
                <p className="text-sm text-amber-900/90 font-medium leading-relaxed">{event.prize_info}</p>
              </section>
            )}

            {/* Results */}
            {event.results?.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Results</h2>
                <div className="space-y-3">
                  {event.results.map((result: any) => (
                    <div key={result.id} className="flex items-center gap-4 bg-slate-50 rounded-xl p-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        result.position === 1 ? "bg-amber-100 text-amber-700" :
                        result.position === 2 ? "bg-slate-100 text-slate-700" :
                        result.position === 3 ? "bg-orange-100 text-orange-700" :
                        "bg-slate-100 text-slate-500"
                      }`}>
                        {result.position === 1 ? "🥇" : result.position === 2 ? "🥈" : result.position === 3 ? "🥉" : `#${result.position}`}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 text-sm">
                          {result.team_name || result.profile?.name || "Participant"}
                        </p>
                        {result.prize && <p className="text-xs text-slate-500">{result.prize}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Gallery */}
            {(() => {
              const validGallery = (event.images || []).filter(
                (img: any) => Boolean((img?.url || img?.image_url || "").trim())
              );
              if (validGallery.length === 0) return null;
              return (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <ImageIcon className="w-5 h-5 text-slate-500" />
                    <h2 className="text-lg font-bold text-slate-900">Event Gallery</h2>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{validGallery.length}</span>
                  </div>
                  <EventGallery images={validGallery} />
                </section>
              );
            })()}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Registration card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm sticky top-20">
              {/* Participation stats */}
              <div className="flex items-center justify-around mb-5 pb-5 border-b border-slate-50">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">{formatCount(registrationCount)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Registered</p>
                </div>
                <div className="w-px h-8 bg-slate-100" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">{formatCount(interestCount)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Interested</p>
                </div>
                {event.max_participants && (
                  <>
                    <div className="w-px h-8 bg-slate-100" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900">
                        {Math.max(0, event.max_participants - registrationCount)}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">Seats left</p>
                    </div>
                  </>
                )}
              </div>

              {/* Capacity bar */}
              {event.max_participants && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-1.5 text-xs text-slate-500">
                    <span>{registrationCount} registered</span>
                    <span>Max {event.max_participants}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        capacityPct >= 90 ? "bg-red-500" : capacityPct >= 70 ? "bg-amber-500" : "bg-primary-500"
                      }`}
                      style={{ width: `${capacityPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 text-right">{capacityPct}% full</p>
                </div>
              )}

              {/* Registration deadline */}
              {event.registration_deadline && isUpcoming && (
                <div className="bg-amber-50 rounded-xl px-3 py-2 mb-4">
                  <p className="text-xs text-amber-700">
                    <span className="font-semibold">Registration closes:</span> {formatDate(event.registration_deadline, "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              )}

              {/* Register button */}
              <div id="register" className="space-y-2">
                {isCompleted ? (
                  <div className="w-full py-3 bg-slate-50 text-slate-500 text-sm font-medium rounded-xl text-center border border-slate-200">
                    Event Completed
                  </div>
                ) : status === "CANCELLED" ? (
                  <div className="w-full py-3 bg-slate-50 text-slate-500 text-sm font-medium rounded-xl text-center border border-slate-200">
                    Event Cancelled
                  </div>
                ) : isRegistered ? (
                  <>
                    <div className="flex items-center gap-2 py-3 px-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-800">You're registered!</span>
                    </div>
                    <button
                      onClick={() => setShowQR(!showQR)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <QrCode className="w-4 h-4" />
                      {showQR ? "Hide" : "Show"} QR Code
                    </button>
                    {showQR && registrationData && (
                      <QRDisplay
                        registrationId={registrationData.id}
                        registrationNumber={registrationData.registration_number}
                        eventTitle={event.title}
                      />
                    )}
                    {isUpcoming && (
                      <button
                        onClick={handleRegister}
                        disabled={loading === "register"}
                        className="w-full py-2.5 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors border border-red-100"
                      >
                        {loading === "register" ? "Cancelling…" : "Cancel Registration"}
                      </button>
                    )}
                  </>
                ) : !registrationOpen ? (
                  <div className="w-full py-3 bg-slate-50 text-slate-500 text-sm font-medium rounded-xl text-center border border-slate-200">
                    {event.max_participants && registrationCount >= event.max_participants
                      ? "Event is Full"
                      : "Registration Closed"}
                  </div>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={loading === "register"}
                    className="w-full py-3 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60"
                  >
                    {loading === "register" ? "Registering…" : "Register Now"}
                  </button>
                )}

                {/* Interest + Share */}
                <div className="flex gap-2">
                  <button
                    onClick={handleInterest}
                    disabled={loading === "interest"}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
                      isInterested
                        ? "bg-red-50 border-red-100 text-red-600"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isInterested ? "fill-red-500" : ""}`} />
                    {loading === "interest" ? "…" : isInterested ? "Interested" : "Interested?"}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Organizer card */}
            {event.organizer_name && (
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Organizer</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    {event.organizer_avatar_url ? (
                      <Image src={event.organizer_avatar_url} alt={event.organizer_name} width={40} height={40} className="rounded-full" />
                    ) : (
                      <span className="text-primary-700 font-bold text-sm">
                        {event.organizer_name[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{event.organizer_name}</p>
                    {event.college_name && <p className="text-xs text-slate-500">{event.college_name}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Certificate */}
            {event.has_certificate && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h3 className="text-sm font-semibold text-amber-900">Certificate</h3>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  {isCompleted
                    ? "Certificates are available for participants who attended this event."
                    : "Attend this event to earn a verified participation certificate."}
                </p>
                {isCompleted && isRegistered && (
                  <Link
                    href="/certificates"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-900"
                  >
                    View my certificates
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            )}

            {/* Online meeting link */}
            {event.meeting_url && (isLive || isRegistered) && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-semibold text-emerald-900">Join Online</h3>
                </div>
                <a
                  href={event.meeting_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700 hover:text-emerald-900"
                >
                  Join Meeting
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      {(isUpcoming || isLive) && (
        <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-slate-100 px-4 py-3 flex gap-3">
          <button
            onClick={handleInterest}
            disabled={loading === "interest"}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
              isInterested ? "bg-red-50 border-red-100 text-red-600" : "bg-white border-slate-200 text-slate-600"
            }`}
          >
            <Heart className={`w-4 h-4 ${isInterested ? "fill-red-500" : ""}`} />
          </button>
          {!isRegistered && registrationOpen ? (
            <button
              onClick={handleRegister}
              disabled={loading === "register"}
              className="flex-1 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading === "register" ? "Registering…" : "Register Now"}
            </button>
          ) : isRegistered ? (
            <button
              onClick={() => setShowQR(!showQR)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl"
            >
              <QrCode className="w-4 h-4" />
              My QR Code
            </button>
          ) : null}
        </div>
      )}

      {/* Quick Customer Registration Modal (No login needed!) */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setShowRegModal(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer text-sm"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Event Registration</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto truncate">
                {event.title}
              </p>
            </div>

            <form onSubmit={handleCompleteRegistration} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@college.edu or gmail.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    College / Institute
                  </label>
                  <input
                    type="text"
                    placeholder="IIT, BITS, NIT..."
                    value={regCollege}
                    onChange={(e) => setRegCollege(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500">
                ⚡ Instant confirmation pass and QR code will be generated immediately upon registration.
              </div>

              <button
                type="submit"
                disabled={loading === "register"}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {loading === "register" ? "Confirming..." : "Get Free Event Pass"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
