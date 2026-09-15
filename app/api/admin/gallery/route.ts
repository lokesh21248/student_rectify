import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, event_id, status } = body;

    if (!name || !event_id) {
      return NextResponse.json({ error: "Name and Event ID are required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get college_id from event to auto-link
    const { data: eventData } = await supabase
      .from("events")
      .select("college_id")
      .eq("id", event_id)
      .single();

    const { data, error } = await supabase
      .from("galleries")
      .insert({
        name,
        event_id,
        college_id: eventData?.college_id || null,
        status: status || 'draft',
        gallery_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error creating gallery:", error);
    return NextResponse.json({ error: error.message || "Failed to create gallery" }, { status: 500 });
  }
}
