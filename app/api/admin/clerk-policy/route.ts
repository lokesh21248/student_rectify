import { NextResponse } from "next/server";

export async function GET() {
  try {
    const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (!pk) {
      return NextResponse.json({
        minLength: 8,
        requireUppercase: false,
        requireLowercase: false,
        requireNumbers: false,
        requireSpecial: false,
        enforceHibp: true,
        isClerk15Policy: false,
      });
    }

    // Decode publishable key to obtain Clerk Frontend API hostname
    let fapiHost = "capable-lion-7348.clerk.accounts.dev";
    try {
      const base64Part = pk.replace(/^pk_(test|live)_/, "").replace(/\$$/, "");
      const decoded = Buffer.from(base64Part, "base64").toString("utf-8").replace(/\$$/, "");
      if (decoded && decoded.includes(".")) {
        fapiHost = decoded;
      }
    } catch {
      // Keep fallback
    }

    const res = await fetch(`https://${fapiHost}/v1/environment`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({
        minLength: 8,
        requireUppercase: false,
        requireLowercase: false,
        requireNumbers: false,
        requireSpecial: false,
        enforceHibp: true,
        isClerk15Policy: false,
      });
    }

    const data = await res.json();
    const pwSettings = data?.user_settings?.password_settings;
    const minLength = typeof pwSettings?.min_length === "number" ? pwSettings.min_length : 8;

    return NextResponse.json({
      minLength: minLength,
      maxLength: pwSettings?.max_length || 72,
      requireUppercase: !!pwSettings?.require_uppercase,
      requireLowercase: !!pwSettings?.require_lowercase,
      requireNumbers: !!pwSettings?.require_numbers,
      requireSpecial: !!pwSettings?.require_special_char,
      enforceHibp: !!pwSettings?.enforce_hibp_on_sign_in,
      isClerk15Policy: minLength > 8,
    });
  } catch (error: any) {
    return NextResponse.json({
      minLength: 8,
      requireUppercase: false,
      requireLowercase: false,
      requireNumbers: false,
      requireSpecial: false,
      enforceHibp: true,
      isClerk15Policy: false,
      error: error.message,
    });
  }
}
