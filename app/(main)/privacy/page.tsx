import type { Metadata } from "next";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read EduEvents' Privacy Policy to understand how we collect, use, and protect your personal information.",
};

const sections = [
  {
    title: "1. Information We Collect",
    content: `When you use EduEvents, we may collect the following information:

**Personal Information:** Name, email address, phone number, college name, year of study, and branch when you register for events.

**Account Information:** When you sign up through Clerk authentication, we receive your name and email from the identity provider (Google, GitHub, or email/password).

**Usage Data:** Pages visited, events viewed, searches performed, and interactions with the platform (collected anonymously and in aggregate).

**Technical Data:** IP address, browser type, device type, operating system, and referral URLs for security and analytics purposes.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use your personal information exclusively to:

- Process your event registrations and send confirmation emails
- Issue and verify digital certificates for attended events
- Send event reminders and relevant notifications (with your consent)
- Improve our platform features and user experience
- Comply with legal obligations and resolve disputes
- Prevent fraud and ensure platform security

We do NOT sell, rent, or trade your personal information to third parties for marketing purposes.`,
  },
  {
    title: "3. Data Sharing",
    content: `Your registration data (name, email, college, phone) is shared with event organizers solely for the purpose of managing attendance at their events. We require all organizers to maintain the confidentiality of participant data.

We use the following trusted third-party services:
- **Supabase** — database and storage infrastructure
- **Clerk** — authentication services
- **Vercel** — hosting and content delivery

Each third party processes data under their own privacy policies, which comply with applicable data protection laws.`,
  },
  {
    title: "4. Cookies & Tracking",
    content: `EduEvents uses cookies and similar technologies to:

- Maintain your session and authentication state
- Remember your preferences and settings
- Analyze site usage in aggregate (no personally identifiable information)

You can control cookie behavior through your browser settings. Disabling cookies may affect some site functionality (particularly authentication).`,
  },
  {
    title: "5. Data Retention",
    content: `We retain your data for as long as your account is active or as needed to provide our services. If you close your account, we will delete your personal information within 30 days, except where retention is required by law.

Certificate records are retained permanently as they form part of verifiable academic achievement records and may be requested by third parties for verification.`,
  },
  {
    title: "6. Your Rights",
    content: `You have the following rights regarding your personal data:

- **Access:** Request a copy of the personal data we hold about you
- **Correction:** Request that inaccurate data be corrected
- **Deletion:** Request deletion of your account and associated data (subject to legal exceptions)
- **Portability:** Request an export of your data in machine-readable format
- **Objection:** Object to processing for marketing purposes

To exercise any of these rights, contact us at privacy@eduevents.in.`,
  },
  {
    title: "7. Security",
    content: `We implement industry-standard security measures including:

- TLS/HTTPS encryption for all data in transit
- Row-Level Security (RLS) policies on our database
- Secure authentication via Clerk with support for 2FA
- Regular security audits and vulnerability assessments

While we take all reasonable steps to protect your data, no system is 100% secure. We recommend using a strong, unique password and enabling two-factor authentication.`,
  },
  {
    title: "8. Children's Privacy",
    content: `EduEvents is designed for college students (18+). We do not knowingly collect personal information from children under 13. If we become aware that we have inadvertently collected data from a child, we will delete it immediately. Parents or guardians who believe their child has provided us personal information may contact us at privacy@eduevents.in.`,
  },
  {
    title: "9. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify users of significant changes via email or a prominent notice on our platform. The date at the bottom of this page indicates when the policy was last updated.`,
  },
  {
    title: "10. Contact Us",
    content: `For privacy-related questions, data requests, or complaints:

**Email:** privacy@eduevents.in  
**Address:** EduEvents Technologies, Bengaluru, Karnataka — 560001, India  
**Response Time:** We aim to respond to all privacy inquiries within 5 business days.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="page-enter pb-16">
      {/* Header */}
      <section className="bg-white border-b border-slate-100">
        <div className="container-page py-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4">
              <Shield className="w-3.5 h-3.5" />
              PRIVACY POLICY
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
              Your Privacy Matters
            </h1>
            <p className="text-slate-500 leading-relaxed">
              This Privacy Policy explains how EduEvents collects, uses, and protects the personal
              information you share with us when using our platform.
            </p>
            <p className="text-xs text-slate-400 mt-4">Last updated: September 2026</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container-page py-12 max-w-3xl">
        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title} className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">{section.title}</h2>
              <div className="text-sm text-slate-600 leading-relaxed space-y-3">
                {section.content.split("\n\n").map((para, i) => (
                  <p key={i} className={para.startsWith("**") ? "font-medium text-slate-800" : ""}>
                    {para.split("**").map((part, j) =>
                      j % 2 === 1 ? (
                        <strong key={j} className="font-semibold text-slate-900">{part}</strong>
                      ) : (
                        part
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
