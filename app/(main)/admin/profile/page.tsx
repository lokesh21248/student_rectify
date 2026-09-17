import type { Metadata } from "next";
import { requireAdminRole } from "@/lib/auth/admin";
import Image from "next/image";
import { User, Mail, Shield, KeyRound, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Profile — Admin Portal",
};

export default async function AdminProfilePage() {
  const session = await requireAdminRole();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Administrator Profile</h2>
        <p className="text-sm text-slate-500">
          Your credentials and access parameters managed securely via Clerk.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-5 mb-8 pb-8 border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-primary-600 text-white font-black text-2xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md shadow-primary-500/20">
            {session.imageUrl ? (
              <Image
                src={session.imageUrl}
                alt={session.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              session.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{session.name}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{session.email}</span>
            </div>
            <div className="mt-2.5">
              <span className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-lg border border-primary-100">
                {session.role}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Security Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <span className="text-xs text-slate-400 block mb-1">Clerk Identifier</span>
              <span className="font-mono text-xs text-slate-700 break-all">{session.userId}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <span className="text-xs text-slate-400 block mb-1">Privilege Level</span>
              <span className="font-semibold text-slate-800">
                {session.isSuperAdmin ? "Full Super Admin Access" : "Standard Admin Access"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
