import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createAdminClient();
    const { id } = await params;
    const body = await req.json();

    const { data, error } = await supabase
      .from("colleges")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ college: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createAdminClient();
    const { id } = await params;

    const { error } = await supabase
      .from("colleges")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
