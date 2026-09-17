import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdminRole } from "@/lib/auth/admin";

export async function GET() {
  try {
    await requireAdminRole(["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"]);
    const supabase = createAdminClient();

    // Run both certificate sources in parallel
    const [adminCertsResult, certsResult] = await Promise.all([
      supabase
        .from("admin_certificates")
        .select("id, certificate_number, recipient_name, recipient_email, event_title, college_name, issue_date, created_at, verified_count")
        .order("created_at", { ascending: false }),
      supabase
        .from("certificates")
        .select("id, certificate_number, recipient_name, event_id, issued_at, created_at")
        .order("created_at", { ascending: false }),
    ]);

    if (!adminCertsResult.error && adminCertsResult.data && adminCertsResult.data.length > 0) {
      return NextResponse.json({ certificates: adminCertsResult.data });
    }

    if (certsResult.error) {
      return NextResponse.json({ certificates: [] });
    }

    return NextResponse.json({ certificates: certsResult.data || [] });
  } catch (error: any) {
    return NextResponse.json({ certificates: [], error: error.message }, { status: error.statusCode || 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminRole(["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"]);
    const body = await req.json();
    const {
      recipient_name,
      recipient_email,
      event_title,
      college_name,
      issue_date = new Date().toISOString().split("T")[0],
    } = body;

    if (!recipient_name || !recipient_email || !event_title) {
      return NextResponse.json(
        { error: "Missing required fields: recipient_name, recipient_email, event_title" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Generate certificate number: CERT-YYYY-XXXXXX
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString();
    const certificate_number = `CERT-${year}-${randomSuffix}`;

    // Use admin_certificates table (doesn't require FK constraints)
    const { data: cert, error } = await supabase
      .from("admin_certificates")
      .insert({
        certificate_number,
        recipient_name,
        recipient_email,
        event_title,
        college_name: college_name || "EduEvents Partner Institution",
        issue_date,
      })
      .select()
      .single();

    if (error) {
      console.error("Issue certificate error:", error);

      // If admin_certificates table doesn't exist yet, return a demo response
      // (user needs to run the SQL migrations)
      if (error.code === "42P01") {
        return NextResponse.json({
          success: true,
          certificate: {
            id: `demo-${Date.now()}`,
            certificate_number,
            recipient_name,
            recipient_email,
            event_title,
            college_name: college_name || "EduEvents Partner Institution",
            issue_date,
            created_at: new Date().toISOString(),
            verified_count: 0,
          },
          warning: "admin_certificates table not found. Please run the SQL migrations in supabase/fix_storage_and_rls.sql",
        });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, certificate: cert });
  } catch (error: any) {
    console.error("Issue certificate error catch:", error);
    return NextResponse.json({ error: error.message || "Failed to issue certificate" }, { status: error.statusCode || 500 });
  }
}
