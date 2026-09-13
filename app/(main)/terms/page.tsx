import type { Metadata } from "next";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the EduEvents Terms of Service — the rules and guidelines that govern use of our platform.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using EduEvents ("the Platform"), you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy. If you disagree with any part of these Terms, you may not use the Platform.

EduEvents is operated by EduEvents Technologies, Bengaluru, India. These Terms constitute a legally binding agreement between you and EduEvents Technologies.`,
  },
  {
    title: "2. Eligibility",
    content: `To use EduEvents, you must:
- Be at least 13 years of age (18+ recommended for event organizers)
- Be a student, educator, or event organizer associated with an educational institution
- Provide accurate and truthful information during registration

We reserve the right to terminate accounts found to have provided false information.`,
  },
  {
    title: "3. User Accounts",
    content: `When you create an account on EduEvents, you are responsible for:

- Maintaining the confidentiality of your login credentials
- All activities that occur under your account
- Notifying us immediately at support@eduevents.in of any unauthorized access

EduEvents accounts are personal and non-transferable. You may not share your account or use another user's account.`,
  },
  {
    title: "4. Event Registrations",
    content: `When you register for an event through EduEvents:

- You agree to attend the event you register for (or cancel in advance if unable to attend)
- You acknowledge that event details (dates, venue, capacity) may change at the organizer's discretion
- You grant the event organizer permission to process your registration data for attendance management
- EduEvents is not responsible for event cancellations, rescheduling, or quality of the event
- Refunds, if applicable, are governed by each organizer's individual refund policy`,
  },
  {
    title: "5. Organizer Responsibilities",
    content: `If you use EduEvents as an event organizer, you agree to:

- Provide accurate, complete, and non-misleading event information
- Not post events that are illegal, offensive, discriminatory, or fraudulent
- Respect participant data privacy and use registration data only for event management
- Issue certificates only to verified attendees
- Comply with all applicable laws, including data protection regulations
- Obtain all necessary permissions and approvals from your institution

EduEvents reserves the right to reject, remove, or suspend any event at its discretion.`,
  },
  {
    title: "6. Certificates",
    content: `Digital certificates issued through EduEvents:

- Represent verified attendance at registered events
- Are digitally signed and publicly verifiable via QR code at /verify
- May not be altered, forged, or misrepresented
- Remain on the EduEvents platform permanently for verification purposes

Fraudulent use of certificates or misrepresentation of attendance may result in account termination and legal action.`,
  },
  {
    title: "7. Prohibited Conduct",
    content: `You may not use EduEvents to:

- Post spam, unsolicited messages, or misleading content
- Harvest user data or scrape the platform without authorization
- Circumvent authentication, access controls, or security measures
- Upload malicious code, viruses, or harmful software
- Impersonate other users, organizers, or institutions
- Engage in any activity that disrupts the platform's normal operation
- Violate any applicable local, national, or international law

Violations may result in immediate account termination and legal action.`,
  },
  {
    title: "8. Intellectual Property",
    content: `All content on EduEvents — including text, graphics, logos, software, and user interface elements — is the intellectual property of EduEvents Technologies or its licensors and is protected under applicable copyright, trademark, and intellectual property laws.

You retain ownership of content you submit (event descriptions, images). By submitting content, you grant EduEvents a non-exclusive, royalty-free license to use, display, and distribute that content on the Platform.`,
  },
  {
    title: "9. Limitation of Liability",
    content: `EduEvents is provided "as is" without warranties of any kind, express or implied. To the maximum extent permitted by law:

- EduEvents is not liable for event cancellations, poor event quality, or organizer misconduct
- EduEvents is not responsible for losses arising from unauthorized account access
- Our total liability for any claim shall not exceed INR 500 or the amount paid to us in the last 3 months, whichever is less

Nothing in these Terms excludes liability for death, personal injury, or fraud caused by our negligence.`,
  },
  {
    title: "10. Termination",
    content: `We reserve the right to suspend or terminate your account if you violate these Terms. You may also delete your account at any time from your profile settings.

On termination:
- Your access to the Platform will cease immediately
- Your personal data will be deleted within 30 days (except certificate records and legally required data)
- Outstanding obligations under these Terms survive termination`,
  },
  {
    title: "11. Changes to Terms",
    content: `We may revise these Terms at any time. When we do, we will update the date below and notify active users via email for significant changes. Continued use of EduEvents after changes constitutes acceptance of the revised Terms.`,
  },
  {
    title: "12. Governing Law",
    content: `These Terms are governed by and construed in accordance with the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Bengaluru, Karnataka, India.`,
  },
  {
    title: "13. Contact",
    content: `For questions about these Terms, contact us at:

**Email:** legal@eduevents.in  
**Address:** EduEvents Technologies, Bengaluru, Karnataka — 560001, India`,
  },
];

export default function TermsPage() {
  return (
    <div className="page-enter pb-16">
      {/* Header */}
      <section className="bg-white border-b border-slate-100">
        <div className="container-page py-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-4">
              <FileText className="w-3.5 h-3.5" />
              TERMS OF SERVICE
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
              Terms of Service
            </h1>
            <p className="text-slate-500 leading-relaxed">
              These Terms of Service govern your use of the EduEvents platform. Please read them carefully
              before using our services.
            </p>
            <p className="text-xs text-slate-400 mt-4">Last updated: September 2026</p>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="container-page pt-10 pb-4 max-w-3xl">
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-bold text-slate-700 mb-4">Table of Contents</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {sections.map((s, i) => (
              <li key={s.title} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                {s.title}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Content */}
      <section className="container-page py-6 max-w-3xl">
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title} className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">{section.title}</h2>
              <div className="text-sm text-slate-600 leading-relaxed space-y-3">
                {section.content.split("\n\n").map((para, i) => (
                  <p key={i}>
                    {para.startsWith("- ") ? (
                      <ul className="list-disc list-inside space-y-1">
                        {para.split("\n").map((item, j) => (
                          <li key={j} className="text-slate-600">
                            {item.replace("- ", "").split("**").map((part, k) =>
                              k % 2 === 1 ? (
                                <strong key={k} className="font-semibold text-slate-900">{part}</strong>
                              ) : (
                                part
                              )
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      para.split("**").map((part, j) =>
                        j % 2 === 1 ? (
                          <strong key={j} className="font-semibold text-slate-900">{part}</strong>
                        ) : (
                          part
                        )
                      )
                    )}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
