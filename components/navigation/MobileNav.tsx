"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
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
  // Ensure SSR and first client paint produce identical HTML.
  // We start with mounted=false (renders all non-auth tabs) then after
  // mount we filter based on actual auth state.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const visibleTabs = tabs.filter((tab) => {
    if (!mounted) return !tab.authRequired; // SSR-safe: hide auth tabs until mounted
    return !tab.authRequired || isSignedIn;
  });

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {visibleTabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 transition-colors min-w-0",
                isActive
                  ? "text-blue-600"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <div className="p-1.5 transition-colors">
                <tab.icon className="w-5 h-5" fill={isActive ? "currentColor" : "none"} strokeWidth={isActive ? 2 : 1.5} />
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
