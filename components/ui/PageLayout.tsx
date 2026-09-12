import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("min-h-screen flex flex-col bg-slate-50", className)}>
      {children}
    </div>
  );
}

export function PageContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main className="flex-1">
      <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", className)}>
        {children}
      </div>
    </main>
  );
}
