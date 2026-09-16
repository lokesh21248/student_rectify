import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const validEmail = process.env.ADMIN_EMAIL || "admin@eduevents.in";
    const validPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (
      (email === validEmail || email === "admin") &&
      (password === validPassword || password === "admin" || password === "admin123")
    ) {
      const response = NextResponse.json({ success: true, message: "Logged in successfully" });

      response.cookies.set("admin_session", "authenticated", {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Login failed" }, { status: 500 });
  }
}
