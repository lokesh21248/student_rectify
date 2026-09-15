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
  "organizer_id",
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
    const supabase = createAdminClient();

    // Organizer upsert logic if provided
    const { organizer_name, organizer_email, organizer_designation, organizer_photo_url } = body;
    let final_organizer_id = body.organizer_id || null;
    
    if (organizer_name) {
      let orgQuery = supabase.from("organizers").select("id");
      if (organizer_email) {
        orgQuery = orgQuery.eq("email", organizer_email);
      } else {
        orgQuery = orgQuery.eq("name", organizer_name);
      }
      
      const { data: existingOrg } = await orgQuery.maybeSingle();
      
      if (existingOrg) {
        const { data: updatedOrg } = await supabase
          .from("organizers")
          .update({
            name: organizer_name,
            email: organizer_email || null,
            designation: organizer_designation || null,
            photo_url: organizer_photo_url || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingOrg.id)
          .select("id")
          .single();
        final_organizer_id = updatedOrg?.id;
      } else {
        const { data: newOrg } = await supabase
          .from("organizers")
          .insert({
            name: organizer_name,
            email: organizer_email || null,
            designation: organizer_designation || null,
            photo_url: organizer_photo_url || null,
          })
          .select("id")
          .single();
        final_organizer_id = newOrg?.id;
      }
    }
    
    // Inject the final organizer_id into the body for sanitation
    if (final_organizer_id) {
      body.organizer_id = final_organizer_id;
    }


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
