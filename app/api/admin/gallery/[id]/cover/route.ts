import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Run auth + params resolution in parallel
    const [{ userId }, body, { id }] = await Promise.all([
      auth(),
      req.json(),
      params,
    ]);

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { cover_image_url, status } = body;
    const supabase = createAdminClient();

    const updates: any = {};
    if (cover_image_url !== undefined) updates.cover_image_url = cover_image_url;
    if (status !== undefined) updates.status = status;

    const { data, error } = await supabase
      .from("galleries")
      .update(updates)
      .eq("id", id)
      .select("id, name, status, cover_image_url")
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error updating gallery:", error);
    return NextResponse.json({ error: error.message || "Failed to update" }, { status: 500 });
  }
}
