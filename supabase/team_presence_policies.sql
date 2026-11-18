-- ====================================================================
-- CUBE TEAM PRESENCE RLS POLICY (Run in Supabase SQL Editor)
-- Allows all authenticated employees to view who has clocked in today
-- ====================================================================

-- 1. Ensure authenticated employees can view active profiles (name, department, employee_id)
DROP POLICY IF EXISTS "Authenticated users can view active profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view active profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (is_active = true);

-- 2. Allow authenticated employees to view today's attendance status of teammates
DROP POLICY IF EXISTS "Authenticated users can view today attendance" ON public.attendances;
CREATE POLICY "Authenticated users can view today attendance"
  ON public.attendances FOR SELECT
  TO authenticated
  USING (
    date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date
  );
