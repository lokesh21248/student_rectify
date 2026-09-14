import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: eventId } = await params;
    const supabase = createAdminClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check existing interest
    const { data: existing } = await supabase
      .from("event_interests")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", profile.id)
      .single();

    if (existing) {
      // Remove interest
      await supabase
        .from("event_interests")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", profile.id);

      revalidatePath('/', 'layout');
      return NextResponse.json({ interested: false });
    } else {
      // Add interest
      await supabase
        .from("event_interests")
        .insert({ event_id: eventId, user_id: profile.id });

      revalidatePath('/', 'layout');
      return NextResponse.json({ interested: true });
    }
  } catch (error) {
    console.error("Interest API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
