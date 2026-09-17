-- Migration: 20260916_admin_profiles.sql
-- Description: Create admin_profiles table for RBAC with Clerk integration

CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'ADMIN' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'EVENT_MANAGER', 'COLLEGE_MANAGER', 'SUPPORT')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_admin_profiles_clerk_user_id ON public.admin_profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_email ON public.admin_profiles(email);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_role ON public.admin_profiles(role);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_status ON public.admin_profiles(status);

-- Enable Row Level Security
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Service role has full access (Next.js server with SUPABASE_SERVICE_ROLE_KEY)
CREATE POLICY "Service role full access on admin_profiles"
  ON public.admin_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 2: Public/Anon has no direct access (prevents unauthorized client-side tampering)
CREATE POLICY "No public direct access on admin_profiles"
  ON public.admin_profiles
  FOR SELECT
  TO anon
  USING (false);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_admin_profiles_updated_at ON public.admin_profiles;
CREATE TRIGGER trg_admin_profiles_updated_at
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();
