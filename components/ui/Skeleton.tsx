"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton", className)} />;
}

export function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="space-y-2 pt-1">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <div className="pt-3 border-t border-slate-50 flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function EventCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative rounded-2xl overflow-hidden">
      <Skeleton className="aspect-[16/7] w-full rounded-none" />
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col items-center gap-3">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-2.5 w-10" />
    </div>
  );
}
