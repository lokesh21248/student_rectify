import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("banners")
      .select("id, title, subtitle, image_path, cta_text, cta_action, is_active, sort_order, start_date, end_date, created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const response = NextResponse.json({ banners: data });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch banners" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      subtitle,
      image_path,
      cta_text,
      cta_action,
      is_active = true,
      sort_order = 0,
      start_date,
      end_date,
    } = body;

    if (!title || !image_path) {
      return NextResponse.json(
        { error: "Missing required fields: title, image_path" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const insertPayload = {
      title,
      subtitle: subtitle || null,
      image_path,
      cta_text: cta_text || null,
      cta_action: cta_action || null,
      is_active: Boolean(is_active),
      sort_order: Number(sort_order) || 0,
      start_date: start_date || null,
      end_date: end_date || null,
    };

    const { data: banner, error } = await supabase
      .from("banners")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) {
      console.error("Admin banner POST error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, banner });
  } catch (error: any) {
    console.error("Admin banner POST catch:", error);
    return NextResponse.json({ error: error.message || "Failed to create banner" }, { status: 500 });
  }
}
