import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("events")
      .select(`
        id, title, slug, status, approved, featured, mode, start_at, end_at,
        created_at, registration_count, interest_count, banner_url, college_id,
        categories!category_id(id, name, slug, icon, color),
        colleges!college_id(id, name, slug, logo_url),
        organizers!organizer_id(id, name, email, designation, photo_url)
      `)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const response = NextResponse.json({ events: data });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      slug: rawSlug,
      short_description,
      description,
      category_id,
      college_id,
      organizer_name,
      organizer_email,
      organizer_designation,
      organizer_photo_url,
      mode = "offline",
      venue,
      address,
      city = "New Delhi",
      state = "Delhi",
      meeting_url,
      start_at,
      end_at,
      registration_deadline,
      max_participants = 500,
      eligibility = "Open to all verified college students",
      rules = "Standard event code of conduct applies",
      prize_info = "Certificate & Awards",
      banner_url,
      has_certificate = true,
      featured = false,
      status = "published",
      tags = [],
    } = body;

    if (!title || !category_id || !college_id || !start_at || !end_at) {
      return NextResponse.json(
        { error: "Missing required fields: title, category, college, start_at, end_at" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Run organizer lookup and slug uniqueness check concurrently
    let orgQuery = supabase.from("organizers").select("id");
    if (organizer_name) {
      if (organizer_email) {
        orgQuery = orgQuery.eq("email", organizer_email);
      } else {
        orgQuery = orgQuery.eq("name", organizer_name);
      }
    }

    const rawSlugBase = rawSlug || generateSlug(title);

    const [orgResult, slugResult] = await Promise.all([
      organizer_name ? orgQuery.maybeSingle() : Promise.resolve({ data: null }),
      supabase.from("events").select("id").eq("slug", rawSlugBase).maybeSingle(),
    ]);

    let slug = rawSlugBase;
    if (slugResult.data) {
      slug = `${rawSlugBase}-${Date.now().toString(36).slice(-4)}`;
    }

    // 1. Organizer upsert (sequential since it depends on org lookup result)
    let final_organizer_id = null;
    if (organizer_name) {
      const existingOrg = orgResult.data;
      if (existingOrg) {
        const { data: updatedOrg } = await supabase
          .from("organizers")
          .update({
            name: organizer_name,
            email: organizer_email || null,
            designation: organizer_designation || null,
            photo_url: organizer_photo_url || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingOrg.id)
          .select("id")
          .single();
        final_organizer_id = updatedOrg?.id;
      } else {
        const { data: newOrg } = await supabase
          .from("organizers")
          .insert({
            name: organizer_name,
            email: organizer_email || null,
            designation: organizer_designation || null,
            photo_url: organizer_photo_url || null,
          })
          .select("id")
          .single();
        final_organizer_id = newOrg?.id;
      }
    }

    // 3. Construct insert payload dynamically (omitting organizer_id)
    const insertPayload: any = {
      title,
      slug,
      short_description: short_description || null,
      description: description || null,
      category_id,
      college_id,
      organizer_id: final_organizer_id,
      organizer_name: organizer_name || null,
      mode,
      venue: venue || null,
      address: address || null,
      city: city || null,
      state: state || null,
      meeting_url: meeting_url || null,
      start_at,
      end_at,
      registration_deadline: registration_deadline || null,
      max_participants: Number(max_participants) || 500,
      eligibility: eligibility || null,
      rules: rules || null,
      prize_info: prize_info || null,
      banner_url: banner_url || null,
      has_certificate: Boolean(has_certificate),
      featured: Boolean(featured),
      approved: true, // Admin-created events are auto-approved
      status,
      tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
    };

    // 4. Insert into events table
    const { data: event, error } = await supabase
      .from("events")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) {
      console.error("Admin event POST error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/", "layout");

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    console.error("Admin event POST catch:", error);
    return NextResponse.json({ error: error.message || "Failed to create event" }, { status: 500 });
  }
}
