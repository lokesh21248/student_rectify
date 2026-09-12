import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Public Supabase client (anon key) — safe for customer-side fetching
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/public/banners — fetch active banners for customer app
export async function GET() {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("banners")
      .select("id, title, subtitle, image_path, cta_text, cta_action, sort_order")
      .eq("is_active", true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ banners: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch banners" }, { status: 500 });
  }
}
