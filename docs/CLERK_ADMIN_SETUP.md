# Clerk Authentication & Admin RBAC Setup Guide

This guide documents the enterprise authentication and Role-Based Access Control (RBAC) architecture for the **EduEvents Admin Portal**.

---

## 1. How to Create the Clerk Application

1. Navigate to [dashboard.clerk.com](https://dashboard.clerk.com) and create an account or log in.
2. Click **Create application**.
3. Name your project (e.g. `EduEvents`).
4. Select sign-in options (Email address, Google, etc.).
5. Once created, copy the **Publishable key** and **Secret key** from **API Keys**.

---

## 2. Required Environment Variables

Add the following environment variables to your `.env.local` (local) and Vercel Project Settings (production):

```env
# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URL redirects (Optional / Recommended)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/admin/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Bootstrap Super Admin Emails (comma-separated fallback)
ADMIN_EMAILS=admin@eduevents.in,shekharramireddy@gmail.com

# Supabase Integration
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

> **SECURITY NOTE**: Never commit `CLERK_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to public repositories.

---

## 3. How to Create the First SUPER_ADMIN

You have three convenient methods to bootstrap the first `SUPER_ADMIN`:

### Method A: Bootstrap Email (Instant)
Any user signing in with an email listed in the `ADMIN_EMAILS` environment variable (e.g., `admin@eduevents.in` or `shekharramireddy@gmail.com`) automatically receives `SUPER_ADMIN` privileges server-side.

### Method B: Clerk Dashboard User Metadata
1. Go to **Clerk Dashboard** > **Users**.
2. Select your user account.
3. Scroll down to **Metadata** > **Public Metadata**.
4. Set the role JSON:
   ```json
   {
     "role": "SUPER_ADMIN"
   }
   ```
5. Click **Save**. The user now possesses full Super Admin rights across the portal and APIs.

### Method C: Supabase `admin_profiles` Table
Execute the migration `supabase/migrations/20260916_admin_profiles.sql` in Supabase SQL Editor, then insert your admin record:
```sql
INSERT INTO public.admin_profiles (clerk_user_id, name, email, role, status)
VALUES ('user_2xxxxxxxxx', 'Lead Admin', 'admin@eduevents.in', 'SUPER_ADMIN', 'active');
```

---

## 4. Role-Based Access Control (RBAC) Hierarchy

The platform implements 5 distinct administrator tiers:

| Role | Permissions & Permitted Routes |
| :--- | :--- |
| **`SUPER_ADMIN`** | Full access to all sections (`/admin/*`), settings, and user permissions. |
| **`ADMIN`** | Access to Events, Colleges, Registrations, Categories, Certificates, Analytics, and limited Settings. |
| **`EVENT_MANAGER`** | Access to Events, Registrations, Certificates, and Dashboard. |
| **`COLLEGE_MANAGER`** | Access to Colleges directory, venue coordination, and Dashboard. |
| **`SUPPORT`** | Read-only lookup for Events, Registrations, and Users. |
| **Student / Normal User** | Access restricted. Automatically redirected to `/unauthorized` (403). |

---

## 5. How Route Protection Works

1. **Edge Middleware (`proxy.ts`)**:
   - Intercepts all `/admin/*` requests except `/admin/sign-in`.
   - Checks authentication state via `clerkMiddleware`.
   - Unauthenticated visitors are redirected to `/admin/sign-in?redirect_url=<path>`.
   - Authenticated users without an administrative role are redirected to `/unauthorized`.
   - Role permissions are validated against sub-routes (e.g. `EVENT_MANAGER` cannot open `/admin/settings`).

2. **Server-Side Enforcement (`lib/auth/admin.ts`)**:
   - Inside Server Components and layouts (`app/(main)/admin/layout.tsx`), `requireAdminRole()` verifies the session against Clerk metadata and Supabase before any server data is rendered.

---

## 6. How API Authorization Works

Every admin API endpoint (`/api/admin/events`, `/api/admin/colleges`, `/api/admin/certificates`, etc.) calls `requireAdminRole([allowed_roles])` at the start of execution:

```ts
import { requireAdminRole } from "@/lib/auth/admin";

export async function POST(req: NextRequest) {
  // Verifies Clerk token, userId, and role hierarchy
  await requireAdminRole(["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"]);
  
  // Proceed with Supabase privileged operations...
}
```
If an unauthenticated request is received, the API immediately responds with `401 Unauthorized`. If the user's role is insufficient, the API responds with `403 Forbidden`.

---

## 7. Supabase Database Integration

The `admin_profiles` table stores administrator records:

```sql
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'ADMIN',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```
Run `supabase/migrations/20260916_admin_profiles.sql` in your Supabase SQL Editor. If the table has not yet been migrated, the server gracefully falls back to Clerk `publicMetadata` and bootstrap emails so the platform remains fully functional.

---

## 8. Local Testing Checklist

| Test | Action | Expected Outcome |
| :--- | :--- | :--- |
| **Test 1** | Visit `http://localhost:3000/admin/dashboard` unauthenticated | Redirects to `/admin/sign-in?redirect_url=/admin/dashboard` |
| **Test 2** | Visit `http://localhost:3000/admin` | Redirects to `/admin/dashboard` (or sign-in) |
| **Test 3** | Sign in on `/admin/sign-in` as admin | Access granted to `/admin/dashboard` |
| **Test 4** | Normal student account visits `/admin/dashboard` | Redirects to `/unauthorized` (403 Forbidden) |
| **Test 5** | Click "Sign Out" in Admin Profile menu | Redirects to `/admin/sign-in`; `/admin/dashboard` is inaccessible |
| **Test 6** | `curl -X POST http://localhost:3000/api/admin/events` without auth | Returns `401 Unauthorized` |
| **Test 7** | Open public website navbar | Clerk "Sign In" and "Sign Up" buttons appear; `<UserButton />` displays when logged in |

---

## 9. Production Deployment Checklist

1. **Vercel Environment Variables**:
   Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and `ADMIN_EMAILS` are defined in production.
2. **Clerk Allowed Redirect URLs**:
   In Clerk Dashboard > **Paths**, ensure your production domain (`https://college-event-platform-woad.vercel.app`) is allowed.
3. **Database Migration**:
   Run `supabase/migrations/20260916_admin_profiles.sql` in the production Supabase project.
