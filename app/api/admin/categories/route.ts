import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireAdminRole } from "@/lib/auth/admin";

export async function GET() {
  try {
    await requireAdminRole(["SUPER_ADMIN", "ADMIN"]);
    const supabase = createAdminClient();

    // Fetch categories and event counts in parallel with a single batched count
    const [categoriesResult, countsResult] = await Promise.all([
      supabase
        .from("categories")
        .select("id, name, slug, description, icon, color, sort_order, is_active, image_url, icon_type, created_at")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("events")
        .select("category_id", { count: "exact" })
        .not("category_id", "is", null),
    ]);

    if (categoriesResult.error) {
      console.error("Admin categories GET error:", categoriesResult.error);
      return NextResponse.json({ error: categoriesResult.error.message }, { status: 500 });
    }

    // Build count map from the single events query
    const countMap: Record<string, number> = {};
    (countsResult.data || []).forEach((row: any) => {
      countMap[row.category_id] = (countMap[row.category_id] || 0) + 1;
    });

    const categoriesWithCounts = (categoriesResult.data || []).map((cat: any) => ({
      ...cat,
      event_count: countMap[cat.id] ?? 0,
    }));

    const response = NextResponse.json({ success: true, data: categoriesWithCounts });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error: any) {
    console.error("Admin categories GET catch:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch categories" }, { status: error.statusCode || 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminRole(["SUPER_ADMIN", "ADMIN"]);
    const body = await req.json();
    const { name, slug, description, icon, color, sort_order, is_active, image_url, icon_type } = body;

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
        image_url: image_url || null,
        icon_type: icon_type || "icon",
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
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: error.statusCode || 500 });
  }
}
