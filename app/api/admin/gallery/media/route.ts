import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { gallery_id, media_type, media_url, title, display_order } = body;

    if (!gallery_id || !media_type || !media_url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("gallery_media")
      .insert({
        gallery_id,
        media_type,
        media_url,
        title,
        display_order: display_order || 0,
        media_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error adding media:", error);
    return NextResponse.json({ error: error.message || "Failed to add media" }, { status: 500 });
  }
}
