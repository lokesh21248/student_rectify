import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("colleges")
    .select("id, name, slug, status, logo_url, city, state, website, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const response = NextResponse.json({
    data: data?.map((c: any) => ({ ...c, is_active: c.status !== 'inactive' }))
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function POST(req: Request) {
  try {
    const supabase = createAdminClient();
    const body = await req.json();
    
    if (typeof body.is_active !== 'undefined') {
      body.status = body.is_active ? 'active' : 'inactive';
      delete body.is_active;
    }

    const { data, error } = await supabase
      .from("colleges")
      .insert([body])
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
