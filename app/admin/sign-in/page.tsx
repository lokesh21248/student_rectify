"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignIn, useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  Building2,
  Calendar,
  Users,
  BarChart3,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

function AdminSignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn, user } = useUser();

  const redirectUrl = searchParams.get("redirect_url") || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // If already signed in, redirect to dashboard
  useEffect(() => {
    if (isSignedIn) {
      router.push(redirectUrl);
    }
  }, [isSignedIn, router, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password: password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push(redirectUrl);
        router.refresh();
      } else {
        // Additional verification required (e.g. 2FA)
        setErrorMessage("Additional verification is required for this administrator account.");
      }
    } catch (err: any) {
      const clerkError =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        "Unable to sign in. Please verify your credentials.";
      setErrorMessage(clerkError);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    if (!email.trim()) {
      setErrorMessage("Please enter your admin email address first.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email.trim(),
      });
      setResetSent(true);
    } catch (err: any) {
      setErrorMessage(err.errors?.[0]?.message || err.message || "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: resetCode.trim(),
        password: newPassword,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push(redirectUrl);
        router.refresh();
      } else {
        setErrorMessage("Password reset requires further verification.");
      }
    } catch (err: any) {
      setErrorMessage(err.errors?.[0]?.message || err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Mobile Branding Header */}
      <div className="lg:hidden text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
            E
          </div>
          <span className="font-extrabold text-slate-900 text-xl tracking-tight">
            Edu<span className="text-primary-600">Events</span>
          </span>
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          Admin Portal
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/80 p-8 sm:p-10">
        <div className="mb-8">
          <div className="hidden lg:flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm">
              E
            </div>
            <span className="font-extrabold text-slate-900 text-lg tracking-tight">
              Edu<span className="text-primary-600">Events</span>
            </span>
            <span className="ml-auto text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
              Portal v2.0
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isResetMode ? "Reset Password" : "Welcome Back!"}
          </h2>
          <p className="text-sm text-slate-500 mt-1.5">
            {isResetMode
              ? "Enter your email to receive a password reset code."
              : "Sign in to your admin account to manage the platform."}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Reset Confirmation */}
        {isResetMode && resetSent ? (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-sm text-emerald-800 mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>Verification code sent to <strong>{email}</strong>. Please enter the code and your new password.</div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                required
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="123456"
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-primary-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Set New Password"}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsResetMode(false);
                setResetSent(false);
              }}
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors pt-2"
            >
              Back to Sign In
            </button>
          </form>
        ) : isResetMode ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@eduevents.in"
                  style={{ paddingLeft: "2.75rem" }}
                  className="w-full h-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-primary-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Code"}
            </button>

            <button
              type="button"
              onClick={() => setIsResetMode(false)}
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors pt-2"
            >
              Back to Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@eduevents.in"
                  style={{ paddingLeft: "2.75rem" }}
                  className="w-full h-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsResetMode(true)}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-600 border-slate-300 focus:ring-primary-500 rounded-md cursor-pointer"
                />
                <span>Remember this device</span>
              </label>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading || !isLoaded}
              className="w-full h-12 bg-primary-600 hover:bg-primary-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-primary-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Protected by enterprise Clerk Authentication and role-based access control.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminSignInPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* LEFT SIDE: Blue visual branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />

        {/* Top Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-11 h-11 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary-600/30">
              E
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white">
                Edu<span className="text-primary-400">Events</span>
              </span>
              <p className="text-[11px] text-slate-400 tracking-wider uppercase font-semibold">
                College Event Platform
              </p>
            </div>
          </Link>
        </div>

        {/* Middle Content: Heading & Features */}
        <div className="relative z-10 max-w-lg my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-xs font-semibold mb-6">
            <ShieldCheck className="w-4 h-4 text-primary-400" />
            <span>Enterprise Admin Portal</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight leading-tight mb-4">
            Manage Events. Empower Colleges. Build Better Experiences.
          </h1>
          <p className="text-base text-slate-300 mb-10 leading-relaxed">
            A unified command center for campus coordinators and administrators to manage event lifecycles, student registrations, real-time analytics, and verified certificates.
          </p>

          {/* Feature List */}
          <div className="space-y-4">
            {[
              { icon: Building2, label: "Manage Colleges", desc: "Partner institutions and campus venues" },
              { icon: Calendar, label: "Manage Events", desc: "Schedule, approve, and publish hackathons & fests" },
              { icon: Users, label: "Track Registrations", desc: "Live student registrations and QR attendance" },
              { icon: BarChart3, label: "Analytics", desc: "Real-time participation stats and category trends" },
              { icon: ShieldCheck, label: "Security & Certificates", desc: "Tamper-proof verifiable credential issuance" },
            ].map((feature) => (
              <div key={feature.label} className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-300 flex-shrink-0">
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{feature.label}</h4>
                  <p className="text-xs text-slate-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-6">
          <span>&copy; {new Date().getFullYear()} EduEvents. All rights reserved.</span>
          <span>Version 2.4.0 (Production)</span>
        </div>
      </div>

      {/* RIGHT SIDE: Authentication Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <Suspense
          fallback={
            <div className="w-full max-w-md mx-auto flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          }
        >
          <AdminSignInForm />
        </Suspense>
      </div>
    </div>
  );
}
