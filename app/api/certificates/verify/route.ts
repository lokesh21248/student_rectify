import { NextRequest, NextResponse } from "next/server";
import { getCertificateByNumber } from "@/lib/supabase/queries";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const number = searchParams.get("number");

  if (!number) {
    return NextResponse.json({ error: "Certificate number required" }, { status: 400 });
  }

  try {
    const cert = await getCertificateByNumber(number.trim());
    if (!cert) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    return NextResponse.json({ certificate: cert });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to verify certificate" }, { status: 500 });
  }
}
