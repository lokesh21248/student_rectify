import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const visitorId = req.cookies.get("visitor_id")?.value;
    if (!visitorId) {
      return NextResponse.json({ error: "Missing visitor session" }, { status: 401 });
    }

    const { id: eventId } = await params;
    const supabase = createAdminClient();

    // Check existing interest
    const { data: existing } = await supabase
      .from("event_interests")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_email", visitorId)
      .single();

    if (existing) {
      // Remove interest
      await supabase
        .from("event_interests")
        .delete()
        .eq("event_id", eventId)
        .eq("user_email", visitorId);

      revalidatePath('/', 'layout');
      return NextResponse.json({ interested: false });
    } else {
      // Add interest
      await supabase
        .from("event_interests")
        .insert({ event_id: eventId, user_email: visitorId });

      revalidatePath('/', 'layout');
      return NextResponse.json({ interested: true });
    }
  } catch (error) {
    console.error("Interest API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
