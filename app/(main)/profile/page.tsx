import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/server";
import { Calendar, Award, CheckCircle2, Heart, Mail, Building2, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const supabase = createAdminClient();

  let profile = null;
  const { data } = await supabase
    .from("profiles")
    .select("*, colleges!college_id(name, city)")
    .eq("clerk_user_id", userId)
    .single();
  profile = data;

  const name = profile?.name || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";
  const avatar = profile?.avatar_url || user?.imageUrl;

  return (
    <div className="container-page py-8 page-enter max-w-3xl mx-auto">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm mb-6">
        {/* Cover */}
        <div className="h-28 bg-gradient-to-r from-primary-500 to-violet-600" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-12 mb-4">
            <div className="relative w-20 h-20 rounded-2xl border-4 border-white shadow-sm overflow-hidden flex-shrink-0">
              {avatar ? (
                <Image src={avatar} alt={name} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 bg-primary-100 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-600" />
                </div>
              )}
            </div>
            <div className="pb-2">
              <h1 className="text-xl font-bold text-slate-900">{name}</h1>
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <Mail className="w-3.5 h-3.5" />
                {profile?.email || user?.emailAddresses?.[0]?.emailAddress}
              </div>
            </div>
          </div>

          {(profile?.college?.name || profile?.bio) && (
            <div className="space-y-2">
              {profile?.college?.name && (
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {profile.college.name}
                  {profile.college.city && `, ${profile.college.city}`}
                </div>
              )}
              {profile?.bio && (
                <p className="text-sm text-slate-600 leading-relaxed">{profile.bio}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Registered", value: profile?.events_registered ?? 0, icon: Calendar, color: "text-primary-600 bg-primary-50" },
          { label: "Attended", value: profile?.events_attended ?? 0, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
          { label: "Certificates", value: profile?.certificates_earned ?? 0, icon: Award, color: "text-amber-600 bg-amber-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Role badge */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Account Details</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Role</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
              profile?.role === "super_admin" ? "bg-red-50 text-red-700" :
              profile?.role === "college_admin" ? "bg-violet-50 text-violet-700" :
              profile?.role === "organizer" ? "bg-primary-50 text-primary-700" :
              "bg-slate-100 text-slate-600"
            }`}>
              {profile?.role || "Student"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Member Since</span>
            <span className="text-sm text-slate-700">{profile?.created_at ? formatDate(profile.created_at, "MMMM yyyy") : "—"}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-50">
          <p className="text-xs text-slate-400">
            Profile synced from your Clerk account. To update your name or avatar, visit your account settings.
          </p>
        </div>
      </div>
    </div>
  );
}
