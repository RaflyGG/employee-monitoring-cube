-- ====================================================================
-- CUBE ADMIN RLS POLICIES (Run in Supabase Dashboard -> SQL Editor)
-- Aligns RLS with live schema roles: 'EMPLOYEE', 'SUPERVISOR', 'HR_ADMIN'
-- ====================================================================

-- 1. Helper function to check Admin / Supervisor role safely (bypasses RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin_or_supervisor()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role::text IN ('HR_ADMIN', 'SUPERVISOR')
      AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_hr_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role::text = 'HR_ADMIN'
      AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. PROFILES Policies (Admin/Supervisor can read all; HR_ADMIN can update employees)
DROP POLICY IF EXISTS "Admin and Supervisor can view all profiles" ON public.profiles;
CREATE POLICY "Admin and Supervisor can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin_or_supervisor());

DROP POLICY IF EXISTS "HR Admin can update profiles" ON public.profiles;
CREATE POLICY "HR Admin can update profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_hr_admin())
  WITH CHECK (auth.uid() = id OR public.is_hr_admin());

-- 3. OFFICES Policies (All authenticated can read; HR_ADMIN can insert/update)
DROP POLICY IF EXISTS "Authenticated users can read offices" ON public.offices;
CREATE POLICY "Authenticated users can read offices"
  ON public.offices FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "HR Admin can insert offices" ON public.offices;
CREATE POLICY "HR Admin can insert offices"
  ON public.offices FOR INSERT
  TO authenticated
  WITH CHECK (public.is_hr_admin());

DROP POLICY IF EXISTS "HR Admin can update offices" ON public.offices;
CREATE POLICY "HR Admin can update offices"
  ON public.offices FOR UPDATE
  TO authenticated
  USING (public.is_hr_admin())
  WITH CHECK (public.is_hr_admin());

-- 4. ATTENDANCES Policies (Admin/Supervisor can view all employee attendances)
DROP POLICY IF EXISTS "Admin and Supervisor can view all attendances" ON public.attendances;
CREATE POLICY "Admin and Supervisor can view all attendances"
  ON public.attendances FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin_or_supervisor());

-- 5. DAILY_TASKS Policies (Admin/Supervisor can view all employee daily tasks)
DROP POLICY IF EXISTS "Admin and Supervisor can view all daily tasks" ON public.daily_tasks;
CREATE POLICY "Admin and Supervisor can view all daily tasks"
  ON public.daily_tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin_or_supervisor());

-- ====================================================================
-- PROMOTE YOUR FIRST ADMIN ACCOUNT:
-- Replace 'EMP-001' or 'Nama Lengkap Anda' with your registered profile
-- ====================================================================
-- UPDATE public.profiles
-- SET role = 'HR_ADMIN'
-- WHERE employee_id = 'EMP-001';

