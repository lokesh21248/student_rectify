import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: certificateId } = await params;
    const supabase = createAdminClient();

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, name")
      .eq("clerk_user_id", userId)
      .single();

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    // Get certificate
    const { data: certificate } = await supabase
      .from("certificates")
      .select(`
        *,
        events:event_id(title, start_at, colleges!college_id(name), organizers!organizer_id(display_name))
      `)
      .eq("id", certificateId)
      .eq("user_id", profile.id)
      .single();

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found or access denied" }, { status: 404 });
    }

    // Return certificate data for client-side PDF generation
    const event = certificate.events as any;
    return NextResponse.json({
      certificate: {
        id: certificate.id,
        certificate_number: certificate.certificate_number,
        issued_at: certificate.issued_at,
      },
      participant: { name: profile.name },
      event: {
        title: event?.title,
        date: event?.start_at,
        college: event?.colleges?.name,
        organizer: event?.organizers?.display_name,
      },
    });
  } catch (error) {
    console.error("Certificate download error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
