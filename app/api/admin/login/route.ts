import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Password authentication is disabled. Please sign in through the Clerk Admin Portal at /admin/sign-in.",
    },
    { status: 400 }
  );
}
