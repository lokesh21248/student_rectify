import { auth, currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";

export type AdminRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "EVENT_MANAGER"
  | "COLLEGE_MANAGER"
  | "SUPPORT";

export const ADMIN_ROLES: AdminRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "EVENT_MANAGER",
  "COLLEGE_MANAGER",
  "SUPPORT",
];

// Route-level permission map
export const ROUTE_PERMISSIONS: Record<string, AdminRole[]> = {
  "/admin/dashboard": ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER", "COLLEGE_MANAGER", "SUPPORT"],
  "/admin/events": ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER", "SUPPORT"],
  "/admin/colleges": ["SUPER_ADMIN", "ADMIN", "COLLEGE_MANAGER"],
  "/admin/registrations": ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER", "SUPPORT"],
  "/admin/users": ["SUPER_ADMIN", "ADMIN", "SUPPORT"],
  "/admin/categories": ["SUPER_ADMIN", "ADMIN"],
  "/admin/certificates": ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"],
  "/admin/analytics": ["SUPER_ADMIN", "ADMIN"],
  "/admin/settings": ["SUPER_ADMIN", "ADMIN"],
  "/admin/profile": ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER", "COLLEGE_MANAGER", "SUPPORT"],
};

export interface AdminSession {
  userId: string;
  email: string;
  name: string;
  imageUrl?: string;
  role: AdminRole;
  isSuperAdmin: boolean;
}

/**
 * Check whether an email matches bootstrap super admins (configured in env or default)
 */
function isBootstrapAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  const configured = (process.env.ADMIN_EMAILS || "")
    .toLowerCase()
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  // Always include primary administrator addresses as bootstrap fallback
  const defaults = ["admin@eduevents.in", "shekharramireddy@gmail.com"];
  return configured.includes(normalized) || defaults.includes(normalized);
}

/**
 * Resolve the user's admin role server-side.
 * Priority:
 * 1. Clerk user publicMetadata.role (SUPER_ADMIN, ADMIN, etc.)
 * 2. Supabase admin_profiles table
 * 3. Bootstrap super admin email list
 */
export async function getAdminRoleForUser(
  clerkUserId: string,
  userEmail?: string | null,
  publicMetadataRole?: string | null
): Promise<AdminRole | null> {
  // 1. Check Clerk user metadata
  if (publicMetadataRole) {
    const upper = publicMetadataRole.toUpperCase() as AdminRole;
    if (ADMIN_ROLES.includes(upper)) {
      return upper;
    }
  }

  // 2. Check Supabase admin_profiles table (gracefully catch if table not yet migrated)
  try {
    const supabase = createAdminClient();
    const { data: adminProfile } = await supabase
      .from("admin_profiles")
      .select("role, status")
      .eq("clerk_user_id", clerkUserId)
      .eq("status", "active")
      .maybeSingle();

    if (adminProfile?.role) {
      const upper = adminProfile.role.toUpperCase() as AdminRole;
      if (ADMIN_ROLES.includes(upper)) {
        return upper;
      }
    }

    // Also check by email if available
    if (userEmail) {
      const { data: emailProfile } = await supabase
        .from("admin_profiles")
        .select("role, status")
        .eq("email", userEmail.toLowerCase())
        .eq("status", "active")
        .maybeSingle();

      if (emailProfile?.role) {
        const upper = emailProfile.role.toUpperCase() as AdminRole;
        if (ADMIN_ROLES.includes(upper)) {
          return upper;
        }
      }
    }
  } catch {
    // Database table might not exist yet; gracefully proceed to bootstrap check
  }

  // 3. Check bootstrap email list
  if (isBootstrapAdminEmail(userEmail)) {
    return "SUPER_ADMIN";
  }

  return null;
}

/**
 * Get current authenticated admin session. Returns null if not logged in or not an admin.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  if (!user) return null;

  const primaryEmail = user.emailAddresses?.[0]?.emailAddress || "";
  const metaRole = (user.publicMetadata as { role?: string })?.role || null;

  const role = await getAdminRoleForUser(userId, primaryEmail, metaRole);
  if (!role) return null;

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "Administrator";

  return {
    userId,
    email: primaryEmail,
    name: fullName,
    imageUrl: user.imageUrl,
    role,
    isSuperAdmin: role === "SUPER_ADMIN",
  };
}

/**
 * Enforce minimum role in Route Handlers or Server Components.
 * Throws an Error with 401/403 status if unauthorized.
 */
export async function requireAdminRole(allowedRoles?: AdminRole[]): Promise<AdminSession> {
  const session = await getAdminSession();

  if (!session) {
    const error: any = new Error("Unauthorized: Admin authentication required");
    error.statusCode = 401;
    throw error;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    // SUPER_ADMIN has access to everything
    if (session.role !== "SUPER_ADMIN" && !allowedRoles.includes(session.role)) {
      const error: any = new Error("Forbidden: Insufficient administrator permissions");
      error.statusCode = 403;
      throw error;
    }
  }

  return session;
}

/**
 * Check if a role can access a specific route
 */
export function isAuthorizedForRoute(role: AdminRole, pathname: string): boolean {
  if (role === "SUPER_ADMIN") return true;

  // Match exact or prefix
  for (const [routePrefix, roles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname === routePrefix || pathname.startsWith(routePrefix + "/")) {
      return roles.includes(role);
    }
  }

  // Default allow /admin for any valid admin
  return pathname.startsWith("/admin");
}
