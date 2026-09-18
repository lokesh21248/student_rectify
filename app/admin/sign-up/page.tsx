"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSignUp, useUser } from "@clerk/nextjs";
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
  LogIn,
  KeyRound,
  Check,
} from "lucide-react";
import { getSafeRedirectUrl } from "@/lib/auth/redirect";

interface AdminSignUpFormProps {
  initialRedirectUrl?: string;
}

export function AdminSignUpForm({ initialRedirectUrl = "/admin/dashboard" }: AdminSignUpFormProps) {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn, user } = useUser();

  const [redirectUrl, setRedirectUrl] = useState(getSafeRedirectUrl(initialRedirectUrl));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verification step state
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  // Loading & status
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

  // If already authenticated with Clerk, check authorization and route accordingly
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

  // Handle Initial Account Creation
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!isLoaded || !signUp) {
      setErrorMessage("Authentication service is initializing. Please wait a moment and click create account again.");
      return;
    }

    // Validate minimum 8 characters ONLY
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter your password.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setStatusMessage("Creating account...");

    try {
      // 1. Create the Clerk signup with email + password (current SignUpFuture API)
      await signUp.password({
        emailAddress: email.trim(),
        password: password,
      });

      // 2. Route based on what Clerk requires next
      if (signUp.status === "missing_requirements" || signUp.unverifiedFields?.includes("email_address") || signUp.status === "unverified") {
        setStatusMessage("Sending verification code to your email...");
        await signUp.verifications.sendEmailCode();
        setPendingVerification(true);
      } else if (signUp.status === "complete") {
        // Signup completed without requiring email verification
        await signUp.finalize();
        
        setStatusMessage("Activating session...");
        await setActive({ session: signUp.createdSessionId });

        setStatusMessage("Setting up admin profile...");
        const profileRes = await fetch("/api/admin/profile", { method: "POST" });
        if (!profileRes.ok) {
          const profileData = await profileRes.json().catch(() => ({}));
          throw new Error(profileData.error || "Failed to create admin profile.");
        }

        setStatusMessage("Checking admin access...");
        const authCheckRes = await fetch("/api/admin/check-auth");
        const authData = await authCheckRes.json();

        if (authData.authorized) {
          setStatusMessage("Access granted! Entering admin portal...");
          window.location.href = redirectUrl;
        } else {
          setStatusMessage("Account not authorized. Redirecting...");
          window.location.href = "/unauthorized";
        }
      } else {
        // Fallback: always try email verification
        setStatusMessage("Sending verification code to your email...");
        await signUp.verifications.sendEmailCode();
        setPendingVerification(true);
      }
    } catch (err: any) {
      console.error("Admin sign-up error:", err);
      const firstError = err.errors?.[0];
      const code = firstError?.code;
      const message = firstError?.longMessage || firstError?.message || err.message;

      if (code === "form_password_pwned") {
        setErrorMessage(
          "This password has appeared in a data breach and cannot be used for security reasons. Please choose a different password."
        );
      } else if (code === "form_identifier_exists") {
        setErrorMessage("An account with this email address already exists. Please sign in instead.");
      } else {
        setErrorMessage(message || "Unable to create account. Please check your information and try again.");
      }
    } finally {
      setLoading(false);
      setStatusMessage(null);
    }
  };

  // Handle Email Verification Code (OTP)
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!isLoaded || !signUp) {
      setErrorMessage("Authentication service is initializing. Please wait a moment and click verify again.");
      return;
    }

    if (!verificationCode.trim()) {
      setErrorMessage("Please enter the verification code sent to your email.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setStatusMessage("Verifying account...");

    try {
      await signUp.verifications.verifyEmailCode({
        code: verificationCode.trim(),
      });

      if (signUp.status === "complete") {
        await signUp.finalize();

        setStatusMessage("Activating session...");
        await setActive({ session: signUp.createdSessionId });

        setStatusMessage("Setting up admin profile...");
        const profileRes = await fetch("/api/admin/profile", { method: "POST" });
        if (!profileRes.ok) {
          const profileData = await profileRes.json().catch(() => ({}));
          throw new Error(profileData.error || "Failed to create admin profile. Please try signing in.");
        }

        setStatusMessage("Checking admin access...");
        const authCheckRes = await fetch("/api/admin/check-auth");
        const authData = await authCheckRes.json();

        if (authData.authorized) {
          setStatusMessage("Access granted! Entering admin portal...");
          window.location.href = redirectUrl;
        } else {
          setStatusMessage("Account created. Pending administrator authorization...");
          window.location.href = "/unauthorized";
        }
      } else {
        setErrorMessage("Verification requires additional steps. Status: " + signUp.status);
      }
    } catch (err: any) {
      const clerkError =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        "Invalid or expired verification code. Please request a new code.";
      setErrorMessage(clerkError);
    } finally {
      setLoading(false);
      setStatusMessage(null);
    }
  };

  // Resend Verification Code
  const handleResendCode = async () => {
    if (!isLoaded || loading || !signUp) return;
    setLoading(true);
    setErrorMessage(null);
    setStatusMessage("Resending verification code...");
    try {
      await signUp.verifications.sendEmailCode();
      setStatusMessage("New verification code sent! Check your inbox.");
    } catch (err: any) {
      setErrorMessage(err.errors?.[0]?.message || err.message || "Failed to resend code.");
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

      {/* Main Card */}
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
            {pendingVerification ? "Verify Your Email" : "Create Admin Account"}
          </h2>
          <p className="text-sm text-slate-500 mt-1.5">
            {pendingVerification
              ? `We sent a 6-digit code to ${email}.`
              : "Create your account to continue"}
          </p>
        </div>

        {/* Status Alert */}
        {statusMessage && !loading && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-sm text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{statusMessage}</div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* STEP 2: Verification Code Form */}
        {pendingVerification ? (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Verification Code
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoComplete="one-time-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  style={{ paddingLeft: "2.75rem" }}
                  className="w-full h-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 tracking-widest font-mono focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all placeholder:tracking-normal placeholder:font-sans"
                  suppressHydrationWarning
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary-600 hover:bg-primary-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-primary-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{statusMessage || "Verifying account..."}</span>
                </>
              ) : (
                <>
                  <span>Verify & Complete Signup</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
              >
                Resend Code
              </button>
              <button
                type="button"
                onClick={() => {
                  setPendingVerification(false);
                  setVerificationCode("");
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Change Email
              </button>
            </div>
          </form>
        ) : (
          /* STEP 1: Registration Form */
          <form onSubmit={handleSignUp} className="space-y-4">
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
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
              <p className="text-xs text-slate-400 mt-1.5 font-normal">
                Minimum 8 characters
              </p>
            </div>

            <div id="clerk-captcha"></div>

            {/* Confirm Password field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all placeholder:text-slate-400"
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Confirm Password matching status */}
              {confirmPassword.length > 0 && (
                <div className="mt-1.5 text-xs flex items-center gap-1.5">
                  {password === confirmPassword ? (
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      Passwords match
                    </span>
                  ) : (
                    <span className="text-red-500 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      Passwords do not match
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary-600 hover:bg-primary-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-primary-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{statusMessage || "Creating account..."}</span>
                </>
              ) : (
                <>
                  <span>Create Admin Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Sign In Link */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            Already have an account?{" "}
            <Link
              href={`/admin/sign-in${initialRedirectUrl !== "/admin/dashboard" ? `?redirect_url=${encodeURIComponent(initialRedirectUrl)}` : ""}`}
              className="font-bold text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
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

export default function AdminSignUpPage() {
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
        <AdminSignUpForm />
      </div>
    </div>
  );
}
