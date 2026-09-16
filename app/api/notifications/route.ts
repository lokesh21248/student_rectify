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
      .select("id, title, body, type, read, action_url, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20);

    const response = NextResponse.json({ notifications: data || [] });
    response.headers.set("Cache-Control", "no-store");
    return response;
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

    // Fire update without waiting for confirmation
    const updateQuery = notificationId
      ? supabase.from("notifications").update({ read: true }).eq("id", notificationId).eq("user_id", profile.id)
      : supabase.from("notifications").update({ read: true }).eq("user_id", profile.id).eq("read", false);

    await updateQuery;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
