import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/public/services?category_id=xxx&search=yyy
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category_id = searchParams.get("category_id");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = supabase
      .from("services")
      .select("id, name, description, price, discount_price, duration_minutes, image_path, sort_order, category_id, categories!category_id(id, name)")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(limit);

    if (category_id) {
      query = query.eq("category_id", category_id);
    }

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ services: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch services" }, { status: 500 });
  }
}
