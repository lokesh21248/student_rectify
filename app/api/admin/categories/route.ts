import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("Admin categories GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Include event counts for admin dashboard
    const categoriesWithCounts = await Promise.all(
      data.map(async (cat: any) => {
        const { count } = await supabase
          .from("events")
          .select("id", { count: "exact", head: true })
          .eq("category_id", cat.id);
        return { ...cat, event_count: count ?? 0 };
      })
    );

    return NextResponse.json({ success: true, data: categoriesWithCounts });
  } catch (error: any) {
    console.error("Admin categories GET catch:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, description, icon, color, sort_order, is_active } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    
    // Check for duplicate slug
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Category with this slug already exists" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: name.trim(),
        slug: slug.trim(),
        description: description?.trim() || null,
        icon: icon || "more-horizontal",
        color: color || "#6366F1",
        sort_order: sort_order ?? 0,
        is_active: is_active ?? true,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Admin category POST error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/", "layout");

    return NextResponse.json({ success: true, category: data });
  } catch (error: any) {
    console.error("Admin category POST catch:", error);
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 });
  }
}
