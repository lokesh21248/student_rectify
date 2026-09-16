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

    // Try to upsert (insert or ignore if already exists)
    const { error: upsertError } = await supabase
      .from("event_interests")
      .upsert(
        { event_id: eventId, user_email: visitorId },
        { onConflict: "event_id,user_email", ignoreDuplicates: false }
      );

    // If upsert succeeds cleanly — it was a new record (interested)
    // If it fails with a unique-violation code — it already existed, so we delete it
    if (upsertError) {
      // Unique-constraint code in Postgres = 23505
      if (upsertError.code === "23505") {
        await supabase
          .from("event_interests")
          .delete()
          .eq("event_id", eventId)
          .eq("user_email", visitorId);

        revalidatePath("/", "layout");
        return NextResponse.json({ interested: false });
      }
      throw upsertError;
    }

    revalidatePath("/", "layout");
    return NextResponse.json({ interested: true });
  } catch (error) {
    console.error("Interest API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
