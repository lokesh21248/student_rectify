import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const supabase = createAdminClient();

    const { data: organizer, error } = await supabase
      .from("organizers")
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, organizer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update organizer" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase.from("organizers").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete organizer" }, { status: 500 });
  }
}
