import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("services")
      .select(`
        *,
        categories!category_id(id, name, slug)
      `)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ services: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      category_id,
      name,
      description,
      price,
      discount_price,
      duration_minutes = 60,
      image_path,
      is_active = true,
      sort_order = 0,
    } = body;

    if (!name || !price) {
      return NextResponse.json(
        { error: "Missing required fields: name, price" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const insertPayload = {
      category_id: category_id || null,
      name,
      description: description || null,
      price: Number(price) || 0,
      discount_price: discount_price ? Number(discount_price) : null,
      duration_minutes: Number(duration_minutes) || 60,
      image_path: image_path || null,
      is_active: Boolean(is_active),
      sort_order: Number(sort_order) || 0,
    };

    const { data: service, error } = await supabase
      .from("services")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) {
      console.error("Admin service POST error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, service });
  } catch (error: any) {
    console.error("Admin service POST catch:", error);
    return NextResponse.json({ error: error.message || "Failed to create service" }, { status: 500 });
  }
}
