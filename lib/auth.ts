import { auth, currentUser } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';
import { UserRole, Profile } from '@/types';

/**
 * Get the current Clerk user's role from their publicMetadata.
 */
export async function getCurrentUserRole(): Promise<UserRole> {
  const { sessionClaims } = await auth();
  return (sessionClaims?.metadata as { role?: UserRole })?.role ?? 'student';
}

/**
 * Get the current Clerk user's Supabase profile.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await currentUser();
  if (!user) return null;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from('profiles')
    .select('*, college:colleges(*)')
    .eq('clerk_user_id', user.id)
    .single();

  return data;
}

/**
 * Ensure the current user has a profile in Supabase.
 * Creates one if it doesn't exist yet.
 */
export async function ensureProfile(): Promise<Profile | null> {
  const user = await currentUser();
  if (!user) return null;

  const supabase = createAdminClient();

  // Try to fetch existing profile
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('clerk_user_id', user.id)
    .single();

  if (existing) return existing;

  // Create new profile
  const role = (user.publicMetadata as { role?: UserRole })?.role ?? 'student';

  const { data: newProfile } = await supabase
    .from('profiles')
    .insert({
      clerk_user_id: user.id,
      email: user.emailAddresses[0]?.emailAddress ?? '',
      name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || null,
      avatar_url: user.imageUrl || null,
      role,
    })
    .select('*')
    .single();

  return newProfile;
}

/**
 * Require a minimum role. Throws if unauthorized.
 */
export async function requireRole(minimumRole: UserRole): Promise<void> {
  const roleHierarchy: Record<UserRole, number> = {
    student: 0,
    organizer: 1,
    college_admin: 2,
    super_admin: 3,
  };

  const currentRole = await getCurrentUserRole();
  if (roleHierarchy[currentRole] < roleHierarchy[minimumRole]) {
    throw new Error('Unauthorized: Insufficient role');
  }
}

export async function isOrganizer(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return ['organizer', 'college_admin', 'super_admin'].includes(role);
}

export async function isAdmin(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return ['college_admin', 'super_admin'].includes(role);
}

export async function isSuperAdmin(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role === 'super_admin';
}
