"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Lock, Mail, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("admin@eduevents.in");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials");
      }

      toast.success("Admin access granted");
      const redirectUrl = searchParams.get("from") || "/admin";
      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20 text-white">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Portal Access</h1>
          <p className="text-sm text-slate-500 mt-2">
            Secure control center for managing events, registrations, certificates, and approvals.
          </p>
        </div>

        {/* Card Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@eduevents.in"
                style={{ paddingLeft: '3rem' }}
                className="w-full h-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ paddingLeft: '3rem' }}
                className="w-full h-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              />
            </div>
          </div>

          {/* Quick credentials hint */}
          <div className="p-3 bg-primary-50 border border-primary-100 rounded-xl flex items-start gap-2.5 text-xs text-primary-900">
            <Sparkles className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-primary-800">Default Credentials:</span>
              <p className="text-primary-700 mt-0.5">
                Email: <code className="bg-white/80 px-1 py-0.5 rounded font-mono">admin@eduevents.in</code> · Password: <code className="bg-white/80 px-1 py-0.5 rounded font-mono">admin123</code>
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 px-4 mt-2 bg-primary-600 hover:bg-primary-700 active:scale-[0.99] text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying Access...
              </>
            ) : (
              <>
                Enter Admin Dashboard
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
