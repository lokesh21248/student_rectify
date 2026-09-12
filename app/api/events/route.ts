import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getEvents } from "@/lib/supabase/queries";
import { generateSlug } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const subcategory = searchParams.get("subcategory") || undefined;
    const college = searchParams.get("college") || undefined;
    const mode = searchParams.get("mode") as any || undefined;
    const status = searchParams.get("status") as any || undefined;
    const sort = (searchParams.get("sort") as any) || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const result = await getEvents({
      search,
      category,
      subcategory,
      college,
      mode,
      status,
      sort,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Events GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { publish, ...eventData } = body;

    const supabase = createAdminClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("clerk_user_id", userId)
      .single();

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const allowedRoles = ["organizer", "college_admin", "super_admin"];
    if (!allowedRoles.includes(profile.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { data: organizer } = await supabase
      .from("organizers")
      .select("id, college_id")
      .eq("user_id", profile.id)
      .single();

    if (!organizer) return NextResponse.json({ error: "Organizer profile not found" }, { status: 404 });

    // Ensure unique slug
    let slug = eventData.slug || generateSlug(eventData.title);
    const { data: existing } = await supabase
      .from("events")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const { data: event, error } = await supabase
      .from("events")
      .insert({
        ...eventData,
        slug,
        organizer_id: organizer.id,
        college_id: organizer.college_id,
        status: publish ? "published" : "draft",
        approved: false, // Requires admin approval
      })
      .select("id, slug")
      .single();

    if (error) {
      console.error("Create event error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ event, success: true });
  } catch (error) {
    console.error("Events POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
