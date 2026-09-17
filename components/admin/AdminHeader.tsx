"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import Image from "next/image";
import {
  Bell,
  Search,
  ChevronDown,
  User,
  Shield,
  LogOut,
  Settings,
  ExternalLink,
} from "lucide-react";
import type { AdminSession } from "@/lib/auth/admin";

interface AdminHeaderProps {
  session: AdminSession;
}

const ROLE_BADGES: Record<string, { label: string; className: string }> = {
  SUPER_ADMIN: { label: "SUPER ADMIN", className: "bg-red-50 text-red-700 border-red-200" },
  ADMIN: { label: "ADMIN", className: "bg-blue-50 text-blue-700 border-blue-200" },
  EVENT_MANAGER: { label: "EVENT MANAGER", className: "bg-amber-50 text-amber-700 border-amber-200" },
  COLLEGE_MANAGER: { label: "COLLEGE MANAGER", className: "bg-purple-50 text-purple-700 border-purple-200" },
  SUPPORT: { label: "SUPPORT", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export function AdminHeader({ session }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useClerk();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirectUrl: "/admin/sign-in" });
    router.push("/admin/sign-in");
    router.refresh();
  };

  const badge = ROLE_BADGES[session.role] || {
    label: session.role,
    className: "bg-slate-100 text-slate-700 border-slate-200",
  };

  // Compute breadcrumbs from pathname
  const segments = pathname.split("/").filter(Boolean);
  const currentTitle = segments.length > 1
    ? segments[segments.length - 1].charAt(0).toUpperCase() + segments[segments.length - 1].slice(1)
    : "Dashboard";

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Page Title */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight capitalize">
          {currentTitle}
        </h1>
      </div>

      {/* Right: Actions and Admin Profile Dropdown */}
      <div className="flex items-center gap-3">
        {/* Role Badge */}
        <span
          className={`hidden sm:inline-flex items-center px-2.5 py-1 text-[11px] font-bold tracking-wider rounded-lg border ${badge.className}`}
        >
          {badge.label}
        </span>

        {/* Profile Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-600 text-white font-bold flex items-center justify-center overflow-hidden flex-shrink-0 text-sm">
              {session.imageUrl ? (
                <Image
                  src={session.imageUrl}
                  alt={session.name}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                session.name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="hidden md:block text-left pr-1">
              <div className="text-xs font-bold text-slate-900 leading-none truncate max-w-[130px]">
                {session.name}
              </div>
              <div className="text-[10px] text-slate-400 leading-none mt-1 truncate max-w-[130px]">
                {session.email}
              </div>
            </div>

            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              {/* Header Info */}
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {session.name}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {session.email}
                </div>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-md border ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>
              </div>

              {/* Links */}
              <div className="py-1">
                <Link
                  href="/admin/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Admin Profile
                </Link>

                <Link
                  href="/admin/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Portal Settings
                </Link>
              </div>

              {/* Logout */}
              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
