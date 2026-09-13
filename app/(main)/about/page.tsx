import type { Metadata } from "next";
import Link from "next/link";
import { Users, Globe, Award, BookOpen, Zap, Shield, Heart, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "About EduEvents",
  description:
    "EduEvents is India's premier platform for discovering and participating in college events — hackathons, workshops, seminars, cultural fests and more.",
};

const stats = [
  { value: "50,000+", label: "Students Registered" },
  { value: "1,200+", label: "Events Hosted" },
  { value: "300+", label: "Partner Colleges" },
  { value: "15,000+", label: "Certificates Issued" },
];

const values = [
  {
    icon: Users,
    title: "Community First",
    description:
      "We build for students and organizers alike, creating a space where learning and collaboration thrive.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Shield,
    title: "Trust & Transparency",
    description:
      "Every event is verified, every certificate is traceable, and every interaction is secured end-to-end.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Zap,
    title: "Innovation",
    description:
      "We push the boundaries of what's possible with cutting-edge QR attendance, AI-generated certificates, and real-time notifications.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Heart,
    title: "Inclusivity",
    description:
      "From Tier-1 IITs to small-town colleges, we believe every student deserves access to great events.",
    color: "bg-rose-50 text-rose-600",
  },
];

const team = [
  { name: "Vikram Nair", role: "Co-Founder & CEO", avatar: "VN" },
  { name: "Ananya Sharma", role: "Co-Founder & CTO", avatar: "AS" },
  { name: "Rohan Mehta", role: "Head of Product", avatar: "RM" },
  { name: "Priya Iyer", role: "Head of Growth", avatar: "PI" },
];

export default function AboutPage() {
  return (
    <div className="page-enter pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 40%)",
          }}
        />
        <div className="container-page relative py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            About EduEvents
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Connecting Students to
            <span className="text-blue-400"> Extraordinary</span> Experiences
          </h1>
          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            EduEvents is India's premier college event discovery platform — designed to help students
            discover hackathons, workshops, seminars, and cultural fests from universities near them.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg"
            >
              <BookOpen className="w-4 h-4" />
              Explore Events
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-colors"
            >
              <Globe className="w-4 h-4" />
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-slate-100">
        <div className="container-page py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-1">{stat.value}</p>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="container-page py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4">
              OUR MISSION
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-5 leading-tight">
              Empowering every student to participate, learn, and grow
            </h2>
            <p className="text-slate-500 leading-relaxed mb-4">
              We started EduEvents because we saw firsthand how difficult it was for students to discover
              quality events at other colleges. Great hackathons would go unnoticed. Brilliant workshops
              would have empty seats. We believed there was a better way.
            </p>
            <p className="text-slate-500 leading-relaxed">
              Today, EduEvents connects tens of thousands of students with verified events from top colleges
              across India — giving every student an equal opportunity to compete, collaborate, and earn
              recognition through digitally-signed certificates.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {values.map((val) => (
              <div key={val.title} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${val.color}`}>
                  <val.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">{val.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{val.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-slate-50 py-16">
        <div className="container-page">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Meet the Team</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              A passionate group of engineers, designers, and educators committed to transforming how college events work.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="bg-white rounded-2xl border border-slate-100 p-6 text-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  {member.avatar}
                </div>
                <p className="font-bold text-slate-900 text-sm">{member.name}</p>
                <p className="text-xs text-slate-400 mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-16 text-center">
        <div className="max-w-xl mx-auto">
          <Award className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Ready to explore?</h2>
          <p className="text-slate-500 text-sm mb-8">
            Join thousands of students already discovering life-changing events on EduEvents.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              Browse Events
            </Link>
            <Link
              href="/help"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
            >
              Visit Help Center
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
