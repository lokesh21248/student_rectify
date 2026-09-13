import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, BookOpen, Award, Users, CreditCard, MessageCircle, Mail, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "Find answers to your questions about EduEvents — registration, certificates, events, and more.",
};

const faqs = [
  {
    category: "Students",
    icon: Users,
    color: "bg-blue-50 text-blue-600",
    items: [
      {
        question: "How do I register for an event?",
        answer:
          "Navigate to the event page and click 'Register Now'. You'll need to provide your name, email, phone number, college name, and year of study. Registration is free on EduEvents.",
      },
      {
        question: "Can I cancel my registration?",
        answer:
          "Yes. Go to 'My Events', find the event, and click 'Cancel Registration'. Note that cancellations are subject to the event organizer's policy.",
      },
      {
        question: "How do I see my upcoming events?",
        answer:
          "Once signed in, click 'My Events' in the navigation. You'll see all your active registrations, past events attended, and earned certificates.",
      },
      {
        question: "What if I don't get a confirmation email?",
        answer:
          "Check your spam folder. If still missing, go to 'My Events' — if your registration appears there, it was successful. Contact the organizer directly for confirmations.",
      },
    ],
  },
  {
    category: "Organizers",
    icon: BookOpen,
    color: "bg-emerald-50 text-emerald-600",
    items: [
      {
        question: "How do I become an organizer?",
        answer:
          "Create an account, then contact EduEvents support to get your account approved as an organizer. Once approved, you'll have access to the Organizer Dashboard.",
      },
      {
        question: "How do I create an event?",
        answer:
          "Go to 'Organizer Dashboard' and click 'Create Event'. Fill in all required details, upload a banner image, and submit for review. Events go live after admin approval.",
      },
      {
        question: "How does QR attendance work?",
        answer:
          "Each registered participant gets a unique QR code. As an organizer, go to your event's scan page and use the QR scanner to check in participants in real time.",
      },
      {
        question: "Can I issue certificates?",
        answer:
          "Yes. After the event, mark attendees as 'attended' and use the admin certificate issuance tool. Certificates are digitally signed and verifiable via QR code.",
      },
    ],
  },
  {
    category: "Certificates",
    icon: Award,
    color: "bg-violet-50 text-violet-600",
    items: [
      {
        question: "How do I get my certificate?",
        answer:
          "After the event organizer issues your certificate, it will appear in 'My Events' → 'Certificates'. You can download it as a PDF.",
      },
      {
        question: "How do I verify a certificate?",
        answer:
          "Visit /verify/check and enter the certificate number, or scan the QR code printed on the certificate. Verification is instant and public.",
      },
      {
        question: "My certificate has wrong details — what do I do?",
        answer:
          "Contact the event organizer directly or use the 'Report Issue' page to flag the error. We'll coordinate with the organizer to reissue with correct details.",
      },
    ],
  },
];

const contactOptions = [
  { icon: Mail, label: "Email Support", value: "support@eduevents.in", href: "mailto:support@eduevents.in" },
  { icon: MessageCircle, label: "Live Chat", value: "Available 9am–6pm IST", href: "/contact" },
  { icon: Phone, label: "Phone Support", value: "+91 98765 43210", href: "tel:+919876543210" },
];

export default function HelpPage() {
  return (
    <div className="page-enter pb-16">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="container-page py-16 text-center">
          <HelpCircle className="w-14 h-14 mx-auto mb-5 opacity-80" />
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">Help Center</h1>
          <p className="text-white/70 text-lg max-w-lg mx-auto">
            Find answers, guides, and support for everything on EduEvents.
          </p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="container-page py-14">
        <div className="space-y-14">
          {faqs.map((section) => (
            <div key={section.category}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${section.color}`}>
                  <section.icon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">{section.category}</h2>
              </div>
              <div className="space-y-4">
                {section.items.map((item) => (
                  <details
                    key={item.question}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden"
                  >
                    <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer font-semibold text-slate-900 text-sm hover:bg-slate-50 transition-colors list-none">
                      {item.question}
                      <span className="text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0">▼</span>
                    </summary>
                    <div className="px-5 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-100">
                      <div className="pt-4">{item.answer}</div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact options */}
      <section className="bg-slate-50 py-14">
        <div className="container-page">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Still need help?</h2>
            <p className="text-slate-500 text-sm">Our support team is here for you.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {contactOptions.map((opt) => (
              <a
                key={opt.label}
                href={opt.href}
                className="bg-white rounded-2xl border border-slate-200 p-5 text-center hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <opt.icon className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm font-semibold text-slate-900">{opt.label}</p>
                <p className="text-xs text-slate-400 mt-1">{opt.value}</p>
              </a>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/report"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Report a bug or issue →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
