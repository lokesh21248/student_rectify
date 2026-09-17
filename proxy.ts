import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER", "COLLEGE_MANAGER", "SUPPORT"];

// Route-level role restrictions for middleware enforcement
const ROUTE_RESTRICTIONS: Record<string, string[]> = {
  "/admin/events": ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER", "SUPPORT"],
  "/admin/colleges": ["SUPER_ADMIN", "ADMIN", "COLLEGE_MANAGER"],
  "/admin/registrations": ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER", "SUPPORT"],
  "/admin/users": ["SUPER_ADMIN", "ADMIN", "SUPPORT"],
  "/admin/categories": ["SUPER_ADMIN", "ADMIN"],
  "/admin/certificates": ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"],
  "/admin/analytics": ["SUPER_ADMIN", "ADMIN"],
  "/admin/settings": ["SUPER_ADMIN", "ADMIN"],
};

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;
  const authObj = await auth();

  // Root /admin redirect to /admin/dashboard
  if (pathname === "/admin" || pathname === "/admin/") {
    const destination = authObj.userId ? "/admin/dashboard" : "/admin/sign-in";
    return NextResponse.redirect(new URL(destination, req.url));
  }

  // Handle public auth routes: /admin/sign-in and /admin/sign-up
  if (pathname === "/admin/sign-in" || pathname === "/admin/sign-up") {
    if (authObj.userId) {
      const role = ((authObj.sessionClaims?.metadata as any)?.role ||
        (authObj.sessionClaims as any)?.role ||
        "") as string;
      const upperRole = role.toUpperCase();
      if (ADMIN_ROLES.includes(upperRole)) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    }
    // Allow unauthenticated visitors to view sign-in and sign-up
    return NextResponse.next();
  }

  // Protect all other /admin/* routes
  if (pathname.startsWith("/admin")) {
    // 1. Unauthenticated user -> redirect to /admin/sign-in with safe redirect_url
    if (!authObj.userId) {
      const signInUrl = new URL("/admin/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // 2. Authenticated user: Check role if available in sessionClaims
    const userRole = ((authObj.sessionClaims?.metadata as any)?.role ||
      (authObj.sessionClaims as any)?.role ||
      "") as string;
    const upperRole = userRole.toUpperCase();

    // If explicit non-admin role (e.g. 'student' or 'user'), redirect to /unauthorized
    if (upperRole && !ADMIN_ROLES.includes(upperRole)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // If role is known, check granular sub-route restrictions
    if (upperRole && upperRole !== "SUPER_ADMIN") {
      for (const [prefix, allowed] of Object.entries(ROUTE_RESTRICTIONS)) {
        if (pathname === prefix || pathname.startsWith(prefix + "/")) {
          if (!allowed.includes(upperRole)) {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
          }
        }
      }
    }
  }

  const res = NextResponse.next();

  // Assign anonymous visitor ID if one doesn't exist
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
