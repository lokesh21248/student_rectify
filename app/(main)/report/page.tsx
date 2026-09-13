"use client";

import { useState } from "react";
import { AlertTriangle, Bug, MessageSquare, Award, Flag, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const issueTypes = [
  { value: "bug", label: "Bug / Technical Issue", icon: Bug, color: "bg-red-50 text-red-600" },
  { value: "event_dispute", label: "Event Dispute", icon: Flag, color: "bg-amber-50 text-amber-600" },
  { value: "certificate", label: "Certificate Problem", icon: Award, color: "bg-violet-50 text-violet-600" },
  { value: "inappropriate", label: "Inappropriate Content", icon: AlertTriangle, color: "bg-orange-50 text-orange-600" },
  { value: "feedback", label: "General Feedback", icon: MessageSquare, color: "bg-blue-50 text-blue-600" },
];

export default function ReportPage() {
  const [form, setForm] = useState({
    type: "bug",
    name: "",
    email: "",
    url: "",
    description: "",
    severity: "medium",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.description) {
      toast.error("Email and description are required.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
    toast.success("Report submitted! Our team will review it shortly.");
  };

  return (
    <div className="page-enter pb-16">
      {/* Header */}
      <section className="bg-white border-b border-slate-100">
        <div className="container-page py-12">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold mb-4">
              <AlertTriangle className="w-3.5 h-3.5" />
              REPORT AN ISSUE
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
              Help us improve EduEvents
            </h1>
            <p className="text-slate-500 leading-relaxed">
              Found a bug, spotted inappropriate content, or have a problem with your certificate or event? 
              Let us know and we'll investigate promptly.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-12 max-w-2xl">
        {submitted ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-5" />
            <h2 className="text-xl font-bold text-slate-900 mb-3">Report Submitted!</h2>
            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
              Thank you for helping us improve EduEvents. Our team will review your report and follow up 
              via email if more information is needed.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setForm({ type: "bug", name: "", email: "", url: "", description: "", severity: "medium" });
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Submit another report
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Issue Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                  Issue Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {issueTypes.map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        form.type === type.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={type.value}
                        checked={form.type === type.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${type.color}`}>
                        <type.icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="report-name" className="block text-xs font-semibold text-slate-700 mb-1.5">Your Name</label>
                  <input
                    id="report-name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Optional"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="report-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="report-email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* URL + Severity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="report-url" className="block text-xs font-semibold text-slate-700 mb-1.5">Page URL (if applicable)</label>
                  <input
                    id="report-url"
                    name="url"
                    type="url"
                    value={form.url}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="report-severity" className="block text-xs font-semibold text-slate-700 mb-1.5">Severity</label>
                  <select
                    id="report-severity"
                    name="severity"
                    value={form.severity}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="low">Low — cosmetic issue</option>
                    <option value="medium">Medium — functionality affected</option>
                    <option value="high">High — data issue or security</option>
                    <option value="critical">Critical — site is broken</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="report-description" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="report-description"
                  name="description"
                  required
                  rows={5}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the issue in detail — what happened, what you expected, steps to reproduce, etc."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                {submitting ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {submitting ? "Submitting..." : "Submit Report"}
              </button>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
