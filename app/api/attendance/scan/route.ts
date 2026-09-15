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
    const { qrData } = body;

    if (!qrData) {
      return NextResponse.json({ error: "QR data is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get scanner profile & verify they are organizer/admin
    const { data: scannerProfile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("clerk_user_id", userId)
      .single();

    if (!scannerProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const allowedRoles = ["organizer", "college_admin", "super_admin"];
    if (!allowedRoles.includes(scannerProfile.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Parse QR data
    let parsed: { rid: string; eid: string; uid: string };
    try {
      parsed = JSON.parse(qrData);
    } catch {
      return NextResponse.json({ error: "Invalid QR code format" }, { status: 400 });
    }

    const { rid: registrationId, eid: eventId, uid: participantUserId } = parsed;

    // Get registration
    const { data: registration } = await supabase
      .from("event_registrations")
      .select("*, profiles!user_id(name, email), events!event_id(title, start_at, end_at)")
      .eq("id", registrationId)
      .eq("event_id", eventId)
      .eq("user_id", participantUserId)
      .single();

    if (!registration) {
      return NextResponse.json({ error: "Registration not found or invalid QR code" }, { status: 404 });
    }

    if (registration.status === "cancelled") {
      return NextResponse.json({ error: "Registration is cancelled" }, { status: 400 });
    }

    // Verify organizer manages this event
    if (!["college_admin", "super_admin"].includes(scannerProfile.role)) {
      const { data: eventData } = await supabase
        .from("events")
        .select("organizer_id")
        .eq("id", eventId)
        .single();

      if (eventData) {
        const { data: organizer } = await supabase
          .from("organizers")
          .select("user_id")
          .eq("id", eventData.organizer_id)
          .single();

        if (!organizer || organizer.user_id !== scannerProfile.id) {
          return NextResponse.json({ error: "You are not the organizer of this event" }, { status: 403 });
        }
      }
    }

    if (registration.checked_in) {
      return NextResponse.json({
        error: "Already checked in",
        alreadyCheckedIn: true,
        checkedInAt: registration.checked_in_at,
        participant: registration.profiles,
      }, { status: 409 });
    }

    // Record attendance
    const { data: attendance, error: attError } = await supabase
      .from("event_registrations")
      .update({
        checked_in: true,
        status: 'attended',
        checked_in_at: new Date().toISOString()
      })
      .eq("id", registrationId)
      .select("*")
      .single();

    if (attError) {
      console.error("Attendance error:", attError);
      return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 });
    }

    // Create notification for participant
    await supabase
      .from("notifications")
      .insert({
        user_id: participantUserId,
        title: "Attendance Confirmed ✅",
        body: `Your attendance at "${registration.events?.title}" has been recorded.`,
        type: "registration_success",
        action_url: `/events/${eventId}`,
      })
      .catch(() => {});

    return NextResponse.json({
      success: true,
      attendance,
      participant: registration.profiles,
      registrationNumber: registration.registration_number,
    });
  } catch (error) {
    console.error("Attendance scan error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
