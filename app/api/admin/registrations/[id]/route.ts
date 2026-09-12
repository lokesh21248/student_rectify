import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: regId } = await params;
    const body = await req.json();

    const supabase = createAdminClient();

    // Handle attendance check-in: create an event_attendance record
    // instead of updating registration status (which has enum constraint)
    if (body.checked_in === true || body.status === "attended") {
      // First get the registration
      const { data: reg, error: regFetchError } = await supabase
        .from("event_registrations")
        .select("id, event_id, user_id")
        .eq("id", regId)
        .single();

      if (regFetchError || !reg) {
        return NextResponse.json({ error: "Registration not found" }, { status: 404 });
      }

      // Check if attendance already recorded
      const { data: existingAttendance } = await supabase
        .from("event_attendance")
        .select("id")
        .eq("registration_id", regId)
        .maybeSingle();

      if (!existingAttendance) {
        // Insert attendance record
        await supabase.from("event_attendance").insert({
          event_id: reg.event_id,
          user_id: reg.user_id,
          registration_id: reg.id,
        });
      }

      return NextResponse.json({
        success: true,
        registration: { ...reg, status: "attended", checked_in: true },
      });
    }

    // For other updates, update allowed fields only
    const allowedUpdates: Record<string, any> = {};
    if (body.status && ["registered", "cancelled", "waitlisted"].includes(body.status)) {
      allowedUpdates.status = body.status;
    }
    if (body.notes !== undefined) allowedUpdates.notes = body.notes;

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json({ success: true, message: "No valid fields to update" });
    }

    const { data, error } = await supabase
      .from("event_registrations")
      .update(allowedUpdates)
      .eq("id", regId)
      .select()
      .single();

    if (error) {
      console.error("Update registration error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, registration: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update registration" }, { status: 500 });
  }
}
