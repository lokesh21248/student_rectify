"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Building2,
  ClipboardList,
  Users,
  Grid3X3,
  Award,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import type { AdminRole } from "@/lib/auth/admin";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  allowedRoles: AdminRole[];
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER", "COLLEGE_MANAGER", "SUPPORT"],
  },
  {
    href: "/admin/events",
    label: "Events",
    icon: Calendar,
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER", "SUPPORT"],
  },
  {
    href: "/admin/colleges",
    label: "Colleges",
    icon: Building2,
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "COLLEGE_MANAGER"],
  },
  {
    href: "/admin/registrations",
    label: "Registrations",
    icon: ClipboardList,
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER", "SUPPORT"],
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "SUPPORT"],
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: Grid3X3,
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    href: "/admin/certificates",
    label: "Certificates",
    icon: Award,
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"],
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: BarChart3,
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
  },
];

interface AdminSidebarProps {
  userRole: AdminRole;
}

export function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname();

  // Filter navigation items by role
  const visibleItems = NAV_ITEMS.filter(
    (item) => userRole === "SUPER_ADMIN" || item.allowedRoles.includes(userRole)
  );

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col flex-shrink-0">
      {/* Brand Header */}
      <div className="h-16 border-b border-slate-200 px-6 flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm">
            E
          </div>
          <div>
            <div className="font-extrabold text-slate-900 text-base tracking-tight leading-none">
              Edu<span className="text-primary-600">Events</span>
            </div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              Admin Portal
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Management
        </div>

        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? "bg-primary-50 text-primary-700 shadow-sm border border-primary-100/50"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive ? "text-primary-600" : "text-slate-400"
                }`}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary-600" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Public site link & version */}
      <div className="p-3 border-t border-slate-200 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <span>View Public Website</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>
        <div className="px-3.5 py-1 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Version 2.4</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Connected" />
        </div>
      </div>
    </aside>
  );
}
