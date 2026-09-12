"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, BookOpen, Award, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/events", label: "Explore", icon: Compass },
  { href: "/my-events", label: "My Events", icon: BookOpen, authRequired: true },
  { href: "/certificates", label: "Certs", icon: Award, authRequired: true },
  { href: "/profile", label: "Profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          if (tab.authRequired && !isSignedIn) return null;
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors min-w-0",
                isActive
                  ? "text-primary-600"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-colors",
                isActive ? "bg-primary-50" : ""
              )}>
                <tab.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area bottom spacing */}
      <div className="h-safe-bottom" />
    </nav>
  );
}
