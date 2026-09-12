import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Banner ID is required" }, { status: 400 });
    }

    const body = await req.json();
    const supabase = createAdminClient();

    // Whitelist allowed fields for update
    const allowedFields = [
      "title",
      "subtitle",
      "image_path",
      "cta_text",
      "cta_action",
      "is_active",
      "sort_order",
      "start_date",
      "end_date",
    ];

    const updatePayload: any = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updatePayload[key] = body[key];
      }
    }

    const { data: banner, error } = await supabase
      .from("banners")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Admin banner PATCH error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, banner });
  } catch (error: any) {
    console.error("Admin banner PATCH catch:", error);
    return NextResponse.json({ error: error.message || "Failed to update banner" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Banner ID is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("banners")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Admin banner DELETE error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin banner DELETE catch:", error);
    return NextResponse.json({ error: error.message || "Failed to delete banner" }, { status: 500 });
  }
}
