import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({
        authenticated: false,
        authorized: false,
        role: null,
      });
    }

    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({
        authenticated: true,
        authorized: false,
        role: null,
      });
    }

    return NextResponse.json({
      authenticated: true,
      authorized: true,
      role: session.role,
      name: session.name,
      email: session.email,
    });
  } catch (error: any) {
    return NextResponse.json(
      { authenticated: false, authorized: false, error: error.message },
      { status: 500 }
    );
  }
}
