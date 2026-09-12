import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const VALID_EVENT_COLUMNS = new Set([
  "title",
  "slug",
  "short_description",
  "description",
  "category_id",
  "college_id",
  "organizer_name",
  "banner_url",
  "start_at",
  "end_at",
  "registration_deadline",
  "mode",
  "venue",
  "address",
  "city",
  "state",
  "meeting_url",
  "max_participants",
  "eligibility",
  "rules",
  "prize_info",
  "has_certificate",
  "status",
  "approved",
  "featured",
  "tags",
]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await req.json();

    // Sanitize body to only include valid columns from events table
    const updateData: Record<string, any> = {};
    for (const key of Object.keys(body)) {
      if (VALID_EVENT_COLUMNS.has(key)) {
        updateData[key] = body[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid event fields provided for update" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("events")
      .update(updateData)
      .eq("id", eventId)
      .select("*")
      .single();

    if (error) {
      console.error("Update event error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/", "layout");

    return NextResponse.json({ success: true, event: data });
  } catch (error: any) {
    console.error("PATCH admin event catch:", error);
    return NextResponse.json({ error: error.message || "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (error) {
      console.error("Delete event error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/", "layout");

    return NextResponse.json({ success: true, message: "Event deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete" }, { status: 500 });
  }
}
