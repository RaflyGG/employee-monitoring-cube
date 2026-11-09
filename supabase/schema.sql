-- ====================================================================
-- SUPABASE SCHEMA: Employee Attendance & Monitoring System
-- ====================================================================

-- 1. ENUMS & EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('employee', 'hr', 'admin');
CREATE TYPE attendance_status AS ENUM ('present', 'late', 'excused', 'absent');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'completed');

-- 2. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'employee'::user_role NOT NULL,
  department TEXT,
  position TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to automatically populate public.profiles on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'employee'::user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. OFFICES / GEOFENCE LOCATIONS
CREATE TABLE IF NOT EXISTS public.offices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  radius_meters INT DEFAULT 100 NOT NULL,
  address TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ATTENDANCES (Check-in / Check-out with Anti-Fraud Metadata)
CREATE TABLE IF NOT EXISTS public.attendances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  office_id UUID REFERENCES public.offices(id) ON DELETE SET NULL,
  attendance_date DATE DEFAULT CURRENT_DATE NOT NULL,
  
  -- Check-in details
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  check_in_lat DOUBLE PRECISION NOT NULL,
  check_in_lng DOUBLE PRECISION NOT NULL,
  check_in_distance_meters DOUBLE PRECISION,
  check_in_selfie_url TEXT NOT NULL,
  
  -- Check-out details
  check_out_time TIMESTAMPTZ,
  check_out_lat DOUBLE PRECISION,
  check_out_lng DOUBLE PRECISION,
  check_out_distance_meters DOUBLE PRECISION,
  check_out_selfie_url TEXT,
  
  -- Status & Anti-fraud
  status attendance_status DEFAULT 'present'::attendance_status NOT NULL,
  is_verified_geofence BOOLEAN DEFAULT true NOT NULL,
  fraud_meta JSONB DEFAULT '{}'::jsonb, -- e.g. { "fake_gps_detected": false, "device_info": "...", "accuracy": 12.5 }
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,

  CONSTRAINT unique_user_attendance_per_day UNIQUE (user_id, attendance_date)
);

-- 5. DAILY TASKS / WORK LOGS
CREATE TABLE IF NOT EXISTS public.daily_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  attendance_id UUID REFERENCES public.attendances(id) ON DELETE SET NULL,
  task_date DATE DEFAULT CURRENT_DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'todo'::task_status NOT NULL,
  progress_percentage INT DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

-- Helper functions for role checking
CREATE OR REPLACE FUNCTION public.is_hr_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('hr', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_hr_or_admin());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Offices Policies
CREATE POLICY "Anyone authenticated can view offices"
  ON public.offices FOR SELECT
  TO authenticated
  USING (is_active = true OR public.is_hr_or_admin());

CREATE POLICY "HR/Admin can manage offices"
  ON public.offices FOR ALL
  TO authenticated
  USING (public.is_hr_or_admin());

-- Attendances Policies
CREATE POLICY "Employees can view own attendance, HR can view all"
  ON public.attendances FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_hr_or_admin());

CREATE POLICY "Employees can insert own attendance"
  ON public.attendances FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employees can update own attendance (e.g. check-out)"
  ON public.attendances FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_hr_or_admin());

-- Daily Tasks Policies
CREATE POLICY "Employees can manage own tasks, HR can view all"
  ON public.daily_tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_hr_or_admin());

CREATE POLICY "Employees can insert own tasks"
  ON public.daily_tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employees can update own tasks"
  ON public.daily_tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Employees can delete own tasks"
  ON public.daily_tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 7. SUPABASE STORAGE (Bucket: attendance-selfies)
-- Run this in Supabase SQL editor:
INSERT INTO storage.buckets (id, name, public)
VALUES ('attendance-selfies', 'attendance-selfies', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS:
CREATE POLICY "Authenticated users can upload selfies"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'attendance-selfies');

CREATE POLICY "Users can view own selfie or HR can view"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'attendance-selfies');

