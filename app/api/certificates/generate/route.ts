import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify caller is organizer/admin
    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("clerk_user_id", userId)
      .single();

    if (!callerProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const allowedRoles = ["organizer", "college_admin", "super_admin"];
    if (!allowedRoles.includes(callerProfile.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Get event
    const { data: event } = await supabase
      .from("events")
      .select("id, title, end_at, has_certificate, colleges!college_id(name)")
      .eq("id", eventId)
      .single();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.has_certificate) {
      return NextResponse.json({ error: "This event does not issue certificates" }, { status: 400 });
    }

    // Get all attendees who don't have certificates yet
    const { data: attendees } = await supabase
      .from("event_registrations")
      .select("user_id, id as registration_id")
      .eq("event_id", eventId)
      .eq("checked_in", true);

    if (!attendees || attendees.length === 0) {
      return NextResponse.json({ message: "No attendees to issue certificates to", count: 0 });
    }

    // Filter out those who already have certificates
    const { data: existingCerts } = await supabase
      .from("certificates")
      .select("user_id")
      .eq("event_id", eventId);

    const existingUserIds = new Set((existingCerts || []).map((c: any) => c.user_id));
    const eligible = attendees.filter((a: any) => !existingUserIds.has(a.user_id));

    if (eligible.length === 0) {
      return NextResponse.json({ message: "Certificates already issued for all attendees", count: 0 });
    }

    // Generate certificates
    let issued = 0;
    const errors: string[] = [];

    for (const attendee of eligible) {
      try {
        const { data: certNum } = await supabase.rpc("generate_certificate_number");
        const certificateNumber = certNum || `CERT-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

        const { data: cert } = await supabase
          .from("certificates")
          .insert({
            event_id: eventId,
            user_id: attendee.user_id,
            registration_id: attendee.registration_id,
            certificate_number: certificateNumber,
          })
          .select("id")
          .single();

        if (cert) {
          issued++;

          // Notify participant
          await supabase
            .from("notifications")
            .insert({
              user_id: attendee.user_id,
              title: "🎓 Certificate Available!",
              body: `Your certificate for "${event.title}" is ready. Download it now!`,
              type: "certificate_ready",
              action_url: "/certificates",
              metadata: { certificate_id: cert.id, event_id: eventId },
            })
            .catch(() => {});

          // Update user stats
          await supabase.rpc("increment_profile_stat", {
            p_user_id: attendee.user_id,
            p_column: "certificates_earned",
          }).catch(() => {});
          
          // Also update events_attended
          await supabase.rpc("increment_profile_stat", {
            p_user_id: attendee.user_id,
            p_column: "events_attended",
          }).catch(() => {});
        }
      } catch (err) {
        errors.push(`Failed for user ${attendee.user_id}`);
      }
    }

    return NextResponse.json({
      success: true,
      issued,
      total: eligible.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Certificate generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
