import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createAdminClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (!profile) return NextResponse.json({ notifications: [] });

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20);

    return NextResponse.json({ notifications: data || [] });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { notificationId } = await req.json();
    const supabase = createAdminClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    if (notificationId) {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId)
        .eq("user_id", profile.id);
    } else {
      // Mark all as read
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", profile.id)
        .eq("read", false);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
