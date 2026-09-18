"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  UserPlus,
} from "lucide-react";
import { getSafeRedirectUrl } from "@/lib/auth/redirect";

interface AdminSignInFormProps {
  initialRedirectUrl?: string;
}

export function AdminSignInForm({ initialRedirectUrl = "/admin/dashboard" }: AdminSignInFormProps) {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn, user } = useUser();

  const [redirectUrl, setRedirectUrl] = useState(getSafeRedirectUrl(initialRedirectUrl));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Read redirect_url from window.location on mount without SSR mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const target = params.get("redirect_url");
      if (target) {
        setRedirectUrl(getSafeRedirectUrl(target));
      }
    }
  }, []);

  // Password reset flow states
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Check if already signed in on mount
  useEffect(() => {
    if (isSignedIn && user) {
      fetch("/api/admin/check-auth")
        .then((res) => res.json())
        .then((data) => {
          if (data.authorized) {
            window.location.href = redirectUrl;
          } else {
            window.location.href = "/unauthorized";
          }
        })
        .catch(() => {});
    }
  }, [isSignedIn, user, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!isLoaded || !signIn) {
      setErrorMessage("Authentication service is initializing. Please wait a moment and click sign in again.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setStatusMessage("Verifying credentials with Clerk...");

    try {
      await signIn.password({
        identifier: email.trim(),
        password: password,
      });

      if (signIn.status === "complete") {
        await signIn.finalize();

        setStatusMessage("Activating session...");
        await setActive({ session: signIn.createdSessionId });

        setStatusMessage("Checking administrator permissions...");
        const authCheckRes = await fetch("/api/admin/check-auth");
        const authData = await authCheckRes.json();

        if (authData.authorized) {
          setStatusMessage("Access granted! Entering admin portal...");
          window.location.href = redirectUrl;
        } else {
          setStatusMessage("Account not authorized. Redirecting...");
          window.location.href = "/unauthorized";
        }
      } else if (signIn.status === "needs_first_factor" || signIn.status === "needs_second_factor") {
        setErrorMessage("Additional two-factor verification is required for this account.");
      } else {
        setErrorMessage("Sign in incomplete. Please check your credentials or verify your email.");
      }
    } catch (err: any) {
      const clerkError =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        "Invalid email or password. Please verify your administrator credentials.";
      setErrorMessage(clerkError);
    } finally {
      setLoading(false);
      setStatusMessage(null);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!isLoaded || !signIn) {
      setErrorMessage("Authentication service is initializing. Please wait a moment and try again.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Please enter your admin email address first.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // Step 1: Create a sign-in attempt with the email identifier
      await signIn.create({
        identifier: email.trim(),
      });

      // Step 2: Trigger the OTP code delivery to the user's email
      await signIn.resetPasswordEmailCode.sendCode();

      setResetSent(true);
    } catch (err: any) {
      console.error("Forgot password error:", err);
      const firstError = err.errors?.[0];
      const code = firstError?.code;
      const clerkError =
        firstError?.longMessage ||
        firstError?.message ||
        err.message ||
        "Failed to send password reset code.";

      if (code === "form_identifier_not_found") {
        setErrorMessage("No account found with this email address. Please check the spelling or sign up for a new account.");
      } else {
        setErrorMessage(clerkError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!isLoaded || !signIn) {
      setErrorMessage("Authentication service is initializing. Please wait a moment.");
      return;
    }

    if (!resetCode.trim()) {
      setErrorMessage("Please enter the verification code sent to your email.");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await signIn.resetPasswordEmailCode.verifyCode({
        code: resetCode.trim(),
      });

      if (signIn.status === "needs_new_password") {
        await signIn.resetPasswordEmailCode.submitPassword({
          password: newPassword,
          signOutOfOtherSessions: true,
        });
      }

      if (signIn.status === "complete") {
        await signIn.finalize();
        await setActive({ session: signIn.createdSessionId });
        window.location.href = redirectUrl;
      } else {
        setErrorMessage("Password reset requires further verification. Status: " + signIn.status);
      }
    } catch (err: any) {
      console.error("Reset password submit error:", err);
      const firstError = err.errors?.[0];
      const code = firstError?.code;
      const clerkError =
        firstError?.longMessage ||
        firstError?.message ||
        err.message ||
        "Failed to reset password.";

      if (code === "form_password_length_too_short") {
        setErrorMessage(
          "Password must meet the project's minimum length requirement. To allow 8+ characters, ensure Minimum password length is set to 8 in your Clerk Dashboard under User & Authentication > Password."
        );
      } else if (code === "form_password_pwned") {
        setErrorMessage(
          "This password has appeared in a data breach and cannot be used for security reasons. Please choose a different strong password."
        );
      } else if (code === "form_code_incorrect") {
        setErrorMessage("Invalid verification code. Please check your email and enter the code again.");
      } else {
        setErrorMessage(clerkError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto" suppressHydrationWarning>
      {/* Mobile Branding Header */}
      <div className="lg:hidden text-center mb-8">
        <Link href="/" prefetch={false} className="inline-flex items-center gap-2 mb-3">
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

        {/* Password Reset OTP Form */}
        {isResetMode && resetSent ? (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            {/* Accessibility hidden username field */}
            <input type="text" name="username" value={email} autoComplete="username" className="hidden" readOnly tabIndex={-1} />
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-sm text-emerald-800 mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                Verification code sent to <strong>{email}</strong>. Enter code and your new password.
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                required
                autoComplete="one-time-code"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="123456"
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                suppressHydrationWarning
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                suppressHydrationWarning
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
                setResetCode("");
                setNewPassword("");
                setErrorMessage(null);
              }}
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors pt-2 cursor-pointer"
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
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@eduevents.in"
                  style={{ paddingLeft: "2.75rem" }}
                  className="w-full h-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                  suppressHydrationWarning
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
              onClick={() => {
                setIsResetMode(false);
                setErrorMessage(null);
              }}
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors pt-2 cursor-pointer"
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
                  suppressHydrationWarning
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
                  onClick={() => {
                    setIsResetMode(true);
                    setErrorMessage(null);
                  }}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
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
                  suppressHydrationWarning
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
                  className="w-4 h-4 rounded text-primary-600 border-slate-300 focus:ring-primary-500 cursor-pointer"
                  suppressHydrationWarning
                />
                <span>Remember this device</span>
              </label>
            </div>

            <div id="clerk-captcha"></div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary-600 hover:bg-primary-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-primary-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{statusMessage || "Signing in..."}</span>
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

        {/* Create Account Link */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            Don&apos;t have an account?{" "}
            <Link
              href={`/admin/sign-up${initialRedirectUrl !== "/admin/dashboard" ? `?redirect_url=${encodeURIComponent(initialRedirectUrl)}` : ""}`}
              className="font-bold text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Create Admin Account
            </Link>
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
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
          <Link href="/" prefetch={false} className="inline-flex items-center gap-3">
            <div className="w-11 h-11 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary-600/30">
              E
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white">
                Edu<span className="text-primary-400">Events</span>
              </span>
              <span className="block text-[11px] text-slate-400 tracking-wider uppercase font-semibold">
                College Event Platform
              </span>
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
          <span>&copy; 2026 EduEvents. All rights reserved.</span>
          <span>Version 2.4.0 (Production)</span>
        </div>
      </div>

      {/* RIGHT SIDE: Authentication Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <AdminSignInForm />
      </div>
    </div>
  );
}
