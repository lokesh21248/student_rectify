import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";
import { ADMIN_ROLES, AdminRole } from "@/lib/auth/admin";

/**
 * POST /api/admin/profile
 *
 * Creates or ensures an admin_profiles row for the currently authenticated Clerk user.
 * - clerk_user_id is ALWAYS derived from the Clerk session (never trusted from request body).
 * - Default role is "ADMIN".
 * - Default status is "active".
 * - Idempotent: skips insert if row already exists.
 * - Uses service-role Supabase client to bypass RLS safely on the server.
 */
export async function POST() {
  try {
    // 1. Require an authenticated Clerk session
    const { userId } = await auth();

    if (!userId) {
      console.log("[ADMIN_PROFILE] No Clerk session — unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get the full Clerk user object (email, name come from Clerk — not the client)
    const user = await currentUser();
    if (!user) {
      console.log("[ADMIN_PROFILE] currentUser() returned null for userId:", userId);
      return NextResponse.json({ error: "Unable to load user data" }, { status: 401 });
    }

    const clerkUserId = user.id;
    const email =
      user.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)
        ?.emailAddress ??
      user.emailAddresses?.[0]?.emailAddress ??
      "";
    const name =
      (`${user.firstName ?? ""} ${user.lastName ?? ""}`).trim() || user.username || null;

    if (!email) {
      console.error("[ADMIN_PROFILE] Clerk user has no email address");
      return NextResponse.json({ error: "Clerk user has no email address" }, { status: 422 });
    }

    console.log("[ADMIN_PROFILE] Clerk user authenticated");
    console.log("[ADMIN_PROFILE] clerkUserId:", clerkUserId);
    console.log("[ADMIN_PROFILE] email:", email);

    // 3. Use the service-role admin client — bypasses RLS safely server-side
    const supabase = createAdminClient();

    // 4. Check if a profile already exists
    console.log("[ADMIN_PROFILE] checking existing profile");
    const { data: existing, error: fetchError } = await supabase
      .from("admin_profiles")
      .select("id, clerk_user_id, role, status")
      .eq("clerk_user_id", clerkUserId)
      .maybeSingle();

    if (fetchError) {
      console.error("[ADMIN_PROFILE] fetch error:", fetchError.code, fetchError.message);
      return NextResponse.json(
        { error: "Database error while checking existing profile", details: fetchError.message },
        { status: 500 }
      );
    }

    if (existing) {
      // Profile already exists — do not overwrite role/status, just return it
      console.log("[ADMIN_PROFILE] existing profile found — skipping insert");
      return NextResponse.json({
        success: true,
        created: false,
        profile: { id: existing.id, role: existing.role, status: existing.status },
      });
    }

    // 5. Determine role: check Clerk publicMetadata first, default to ADMIN
    const metaRole = (user.publicMetadata as { role?: string })?.role;
    const defaultRole: AdminRole =
      metaRole && ADMIN_ROLES.includes(metaRole.toUpperCase() as AdminRole)
        ? (metaRole.toUpperCase() as AdminRole)
        : "ADMIN";

    // 6. Insert new admin_profiles row
    console.log("[ADMIN_PROFILE] inserting profile for", clerkUserId);
    const { data: inserted, error: insertError } = await supabase
      .from("admin_profiles")
      .insert({
        clerk_user_id: clerkUserId,
        email: email.toLowerCase(),
        name: name,
        role: defaultRole,
        status: "active",
      })
      .select("id, clerk_user_id, role, status")
      .single();

    if (insertError) {
      // Handle unique constraint race-condition gracefully
      if (insertError.code === "23505") {
        console.log("[ADMIN_PROFILE] race-condition: profile already inserted (23505) — safe to proceed");
        return NextResponse.json({ success: true, created: false });
      }
      console.error("[ADMIN_PROFILE] insert error:", insertError.code, insertError.message);
      return NextResponse.json(
        { error: "Database error while creating admin profile", details: insertError.message },
        { status: 500 }
      );
    }

    console.log("[ADMIN_PROFILE] success — created id:", inserted?.id);

    return NextResponse.json({
      success: true,
      created: true,
      profile: { id: inserted?.id, role: inserted?.role, status: inserted?.status },
    });
  } catch (error: any) {
    console.error("[ADMIN_PROFILE] unexpected error:", error?.message ?? error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}
