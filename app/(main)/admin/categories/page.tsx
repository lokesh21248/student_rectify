import type { Metadata } from "next";
import { requireAdminRole } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/server";
import { Grid3X3, Tag } from "lucide-react";
import { MOCK_CATEGORIES } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Event Categories — Admin Portal",
};

export default async function AdminCategoriesPage() {
  await requireAdminRole(["SUPER_ADMIN", "ADMIN"]);

  const supabase = createAdminClient();
  const { data: dbCategories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  const categories = dbCategories && dbCategories.length > 0 ? dbCategories : MOCK_CATEGORIES;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Event Categories</h2>
        <p className="text-sm text-slate-500">
          Taxonomies and discovery filters for campus hackathons, symposiums, sports, and cultural events.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat: any) => (
          <div
            key={cat.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{ backgroundColor: cat.color || "#2563EB" }}
            >
              <Tag className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-slate-900 text-base leading-tight truncate">{cat.name}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{cat.slug}</p>
              {cat.description && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{cat.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
