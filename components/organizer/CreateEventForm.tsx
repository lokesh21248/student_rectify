"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Calendar, MapPin, Wifi, Clock, Users, Upload, Plus, Trash2,
  FileText, Award, ChevronRight, ChevronLeft, Save,
} from "lucide-react";
import { generateSlug } from "@/lib/utils";
import { cn } from "@/lib/utils";

const eventSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  slug: z.string().min(3, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug can only have lowercase letters, numbers, hyphens"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  short_description: z.string().max(200).optional(),
  category_id: z.string().min(1, "Category is required"),
  mode: z.enum(["online", "offline", "hybrid"]),
  venue: z.string().optional(),
  meeting_url: z.string().url().optional().or(z.literal("")),
  start_at: z.string().min(1, "Start date/time is required"),
  end_at: z.string().min(1, "End date/time is required"),
  registration_deadline: z.string().optional(),
  max_participants: z.number().positive().optional().nullable(),
  eligibility: z.string().optional(),
  rules: z.string().optional(),
  prize_info: z.string().optional(),
  has_certificate: z.boolean(),
  tags: z.array(z.string()).optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface CreateEventFormProps {
  categories: { id: string; name: string; slug: string }[];
  organizerId: string;
}

const steps = [
  { id: "basic", label: "Basic Info", icon: FileText },
  { id: "details", label: "Details", icon: MapPin },
  { id: "schedule", label: "Schedule & Rules", icon: Clock },
  { id: "settings", label: "Settings", icon: Award },
];

export function CreateEventForm({ categories, organizerId }: CreateEventFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      mode: "offline",
      has_certificate: false,
      max_participants: null,
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;

  const titleValue = watch("title");

  async function onSubmit(data: EventFormData, publish: boolean) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, publish }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to create event");
      toast.success(publish ? "Event created and submitted for review!" : "Draft saved!");
      router.push(`/organizer/events/${result.event.id}`);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Steps */}
      <div className="flex items-center mb-8">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center flex-1">
            <button
              type="button"
              onClick={() => setCurrentStep(i)}
              className={cn(
                "flex items-center gap-2 py-2 px-3 rounded-xl text-sm font-medium transition-colors",
                i === currentStep
                  ? "bg-primary-600 text-white"
                  : i < currentStep
                  ? "text-primary-600 bg-primary-50"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <step.icon className="w-4 h-4" />
              <span className="hidden sm:block">{step.label}</span>
            </button>
            {i < steps.length - 1 && (
              <div className={cn("flex-1 h-0.5 mx-2", i < currentStep ? "bg-primary-300" : "bg-slate-100")} />
            )}
          </div>
        ))}
      </div>

      <form>
        {/* Step 1: Basic Info */}
        {currentStep === 0 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Event Title *</label>
              <input
                {...register("title")}
                onBlur={() => {
                  if (titleValue && !form.getValues("slug")) {
                    setValue("slug", generateSlug(titleValue));
                  }
                }}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. AI & ML Hackathon 2026"
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">URL Slug *</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400 flex-shrink-0">/events/</span>
                <input
                  {...register("slug")}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="ai-ml-hackathon-2026"
                />
              </div>
              {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Short Description</label>
              <input
                {...register("short_description")}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="One line summary (shown on cards)"
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Description *</label>
              <textarea
                {...register("description")}
                rows={6}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Describe your event in detail..."
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
              <select
                {...register("category_id")}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="text-xs text-red-500 mt-1">{errors.category_id.message}</p>}
            </div>
          </motion.div>
        )}

        {/* Step 2: Details */}
        {currentStep === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Event Mode *</label>
              <div className="grid grid-cols-3 gap-3">
                {(["offline", "online", "hybrid"] as const).map((mode) => (
                  <label key={mode} className={cn(
                    "flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer capitalize text-sm font-medium transition-colors",
                    watch("mode") === mode
                      ? "bg-primary-50 border-primary-300 text-primary-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}>
                    <input type="radio" value={mode} {...register("mode")} className="sr-only" />
                    {mode === "offline" && <MapPin className="w-4 h-4" />}
                    {mode === "online" && <Wifi className="w-4 h-4" />}
                    {mode === "hybrid" && <Users className="w-4 h-4" />}
                    {mode}
                  </label>
                ))}
              </div>
            </div>

            {watch("mode") !== "online" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Venue</label>
                <input
                  {...register("venue")}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. Main Auditorium, IIT Delhi"
                />
              </div>
            )}

            {watch("mode") !== "offline" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Meeting URL</label>
                <input
                  {...register("meeting_url")}
                  type="url"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://meet.google.com/..."
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date & Time *</label>
                <input
                  {...register("start_at")}
                  type="datetime-local"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.start_at && <p className="text-xs text-red-500 mt-1">{errors.start_at.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date & Time *</label>
                <input
                  {...register("end_at")}
                  type="datetime-local"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.end_at && <p className="text-xs text-red-500 mt-1">{errors.end_at.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Registration Deadline</label>
                <input
                  {...register("registration_deadline")}
                  type="datetime-local"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Participants</label>
                <input
                  type="number"
                  min={1}
                  onChange={(e) => setValue("max_participants", e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Leave blank for unlimited"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Rules */}
        {currentStep === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Eligibility</label>
              <textarea
                {...register("eligibility")}
                rows={3}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Who can participate? e.g., Open to all B.Tech students"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Rules & Guidelines</label>
              <textarea
                {...register("rules")}
                rows={4}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="List the rules participants must follow..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Prize Information</label>
              <textarea
                {...register("prize_info")}
                rows={3}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="e.g. 1st Prize: ₹10,000 + Trophy | 2nd Prize: ₹5,000"
              />
            </div>
          </motion.div>
        )}

        {/* Step 4: Settings */}
        {currentStep === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <label className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                {...register("has_certificate")}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <div>
                <p className="text-sm font-medium text-slate-900">Issue Participation Certificates</p>
                <p className="text-xs text-slate-500">Attendees will receive a verified certificate after the event.</p>
              </div>
              <Award className="w-5 h-5 text-amber-500 ml-auto flex-shrink-0" />
            </label>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-xs text-amber-700">
                <strong>Review Process:</strong> After submission, your event will be reviewed by an admin before it's published publicly. This usually takes 24-48 hours.
              </p>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setCurrentStep((s) => s - 1)}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s + 1)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit((d) => onSubmit(d, false))}
                  className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  Save Draft
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit((d) => onSubmit(d, true))}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60"
                >
                  {submitting ? "Publishing…" : "Publish Event"}
                </button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
