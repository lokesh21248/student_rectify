import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home, LogOut } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";

export const metadata = {
  title: "403 — Access Restricted | EduEvents",
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center">
        {/* Shield Icon Badge */}
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-100">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Status Code & Heading */}
        <span className="inline-block px-3 py-1 bg-red-100/70 text-red-700 text-xs font-bold rounded-full mb-3 tracking-wider">
          403 FORBIDDEN
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
          Access Restricted
        </h1>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          You don&apos;t have permission to access this area. Your current account does not possess administrator privileges.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/admin/dashboard"
            className="w-full h-11 px-4 bg-primary-600 hover:bg-primary-700 active:scale-[0.99] text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <Link
            href="/"
            className="w-full h-11 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Return to Website
          </Link>

          <div className="pt-2 border-t border-slate-100">
            <SignOutButton redirectUrl="/admin/sign-in">
              <button
                type="button"
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign in with another account
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>
    </div>
  );
}
