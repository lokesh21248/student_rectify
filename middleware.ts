import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // Protect /admin routes with Clerk
  if (isAdminRoute(req)) {
    const authObj = await auth();

    if (!authObj.userId) {
      // If not logged in, this will redirect to the Clerk sign-in page
      authObj.protect();
    }

    // Check if the user has admin role in their Clerk session claims
    const role = (authObj.sessionClaims?.metadata as any)?.role;
    if (role !== "super_admin" && role !== "college_admin") {
      // Logged in but not an admin -> redirect to home page
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  const res = NextResponse.next();

  // Assign an anonymous visitor ID if one doesn't exist
  if (!req.cookies.has("visitor_id")) {
    res.cookies.set("visitor_id", crypto.randomUUID(), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return res;
});

export const config = {
  matcher: [
    // Protect routes but allow public assets
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
