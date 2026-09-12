import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 });
    }

    const body = await req.json();
    const supabase = createAdminClient();

    // Whitelist allowed fields for update
    const allowedFields = [
      "category_id",
      "name",
      "description",
      "price",
      "discount_price",
      "duration_minutes",
      "image_path",
      "is_active",
      "sort_order",
    ];

    const updatePayload: any = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updatePayload[key] = body[key];
      }
    }

    const { data: service, error } = await supabase
      .from("services")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Admin service PATCH error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, service });
  } catch (error: any) {
    console.error("Admin service PATCH catch:", error);
    return NextResponse.json({ error: error.message || "Failed to update service" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Admin service DELETE error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin service DELETE catch:", error);
    return NextResponse.json({ error: error.message || "Failed to delete service" }, { status: 500 });
  }
}
