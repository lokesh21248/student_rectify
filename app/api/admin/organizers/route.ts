import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("organizers")
      .select("id, name, email, designation, photo_url, organization_name, college_name, phone, website, created_at")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({ organizers: [] });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const response = NextResponse.json({ organizers: data });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch organizers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      photo_url,
      organization_name,
      college_name,
      designation,
      email,
      phone,
      website,
      linkedin,
      instagram,
      description,
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: organizer, error } = await supabase
      .from("organizers")
      .insert({
        name,
        photo_url: photo_url || null,
        organization_name: organization_name || null,
        college_name: college_name || null,
        designation: designation || null,
        email: email || null,
        phone: phone || null,
        website: website || null,
        linkedin: linkedin || null,
        instagram: instagram || null,
        description: description || null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Create organizer error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, organizer });
  } catch (error: any) {
    console.error("Create organizer catch error:", error);
    return NextResponse.json({ error: error.message || "Failed to create organizer" }, { status: 500 });
  }
}
