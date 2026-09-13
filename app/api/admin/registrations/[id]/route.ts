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

    if (body.checked_in === true || body.status === "attended") {
      const { data, error } = await supabase
        .from("event_registrations")
        .update({ 
          status: "attended", 
          checked_in: true, 
          checked_in_at: new Date().toISOString() 
        })
        .eq("id", regId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        registration: data,
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
