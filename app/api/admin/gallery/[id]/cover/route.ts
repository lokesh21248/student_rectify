import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { cover_image_url, status } = body;
    const { id } = await params;

    const supabase = createAdminClient();

    const updates: any = {};
    if (cover_image_url !== undefined) updates.cover_image_url = cover_image_url;
    if (status !== undefined) updates.status = status;

    const { data, error } = await supabase
      .from("galleries")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error updating gallery:", error);
    return NextResponse.json({ error: error.message || "Failed to update" }, { status: 500 });
  }
}
