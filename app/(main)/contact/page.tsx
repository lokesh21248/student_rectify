"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MapPin, Phone, MessageCircle, Send, CheckCircle2, Building2, Clock } from "lucide-react";
import { toast } from "sonner";

// Static metadata in a layout would be better but since this is client we define it inline
// The parent layout handles SEO fallback; a separate metadata.ts would need a server page

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "support@eduevents.in",
    href: "mailto:support@eduevents.in",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "Bengaluru, Karnataka, India",
    href: "https://maps.google.com",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Clock,
    label: "Support Hours",
    value: "Mon–Sat: 9am – 6pm IST",
    href: null,
    color: "bg-violet-50 text-violet-600",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
    toast.success("Your message has been sent! We'll respond within 24 hours.");
  };

  return (
    <div className="page-enter pb-16">
      {/* Hero */}
      <section className="bg-white border-b border-slate-100">
        <div className="container-page py-12">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4">
              <MessageCircle className="w-3.5 h-3.5" />
              CONTACT US
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
              We'd love to hear from you
            </h1>
            <p className="text-slate-500 leading-relaxed">
              Have a question about EduEvents? Want to partner with us? Need help with an event or certificate? 
              Our team is ready to help.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact info sidebar */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-bold text-slate-900 text-lg mb-5">Get in touch</h2>
            {contactInfo.map((info) => (
              <div key={info.label} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${info.color}`}>
                  <info.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{info.label}</p>
                  {info.href ? (
                    <a
                      href={info.href}
                      className="text-sm font-medium text-slate-900 hover:text-blue-600 transition-colors mt-0.5 block"
                    >
                      {info.value}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-slate-900 mt-0.5">{info.value}</p>
                  )}
                </div>
              </div>
            ))}

            <div className="mt-6 p-5 bg-slate-900 rounded-2xl text-white">
              <Building2 className="w-8 h-8 mb-3 text-blue-400" />
              <p className="font-bold text-sm mb-1">Want to become a partner college?</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                EduEvents partners with universities to host events and provide students with a seamless event experience.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 mt-3 transition-colors"
              >
                Learn more about partnering →
              </Link>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-5" />
                <h2 className="text-xl font-bold text-slate-900 mb-3">Message sent!</h2>
                <p className="text-slate-500 text-sm mb-6">
                  Thank you for reaching out. Our team will respond within 24 business hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-sm"
              >
                <h2 className="font-bold text-slate-900 text-lg mb-2">Send a message</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-semibold text-slate-700 mb-1.5">Subject</label>
                  <select
                    id="contact-subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-shadow"
                  >
                    <option value="">Select a topic</option>
                    <option value="general">General Enquiry</option>
                    <option value="partnership">College Partnership</option>
                    <option value="organizer">Become an Organizer</option>
                    <option value="certificate">Certificate Issue</option>
                    <option value="bug">Bug Report</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  {submitting ? (
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
