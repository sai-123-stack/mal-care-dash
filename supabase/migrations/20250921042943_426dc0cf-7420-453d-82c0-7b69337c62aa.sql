-- Add missing columns and policies to existing tables

-- Check if profiles table has the role column, if not add it
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'healthworker' CHECK (role IN ('admin', 'healthworker'));
        ALTER TABLE public.profiles ADD COLUMN username TEXT UNIQUE;
    END IF;
END $$;

-- Check if children table has missing columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='children' AND column_name='current_status') THEN
        ALTER TABLE public.children ADD COLUMN current_status TEXT DEFAULT 'normal' CHECK (current_status IN ('sam', 'mam', 'normal'));
    END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthworkers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all healthworkers" ON public.healthworkers;
DROP POLICY IF EXISTS "Healthworkers can view their own record" ON public.healthworkers;
DROP POLICY IF EXISTS "Admins can view all children" ON public.children;
DROP POLICY IF EXISTS "Healthworkers can view children in their AWC" ON public.children;
DROP POLICY IF EXISTS "Healthworkers can insert children in their AWC" ON public.children;
DROP POLICY IF EXISTS "Healthworkers can update children in their AWC" ON public.children;
DROP POLICY IF EXISTS "Admins can view all health records" ON public.health_records;
DROP POLICY IF EXISTS "Healthworkers can view health records for their AWC children" ON public.health_records;
DROP POLICY IF EXISTS "Healthworkers can insert health records for their AWC children" ON public.health_records;
DROP POLICY IF EXISTS "Healthworkers can update health records for their AWC children" ON public.health_records;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    ) OR NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin')
  );

-- Healthworkers policies
CREATE POLICY "Admins can manage all healthworkers"
  ON public.healthworkers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Healthworkers can view their own record"
  ON public.healthworkers FOR SELECT
  USING (user_id = auth.uid());

-- Children policies
CREATE POLICY "Admins can view all children"
  ON public.children FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Healthworkers can manage children in their AWC"
  ON public.children FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.healthworkers h
      JOIN public.profiles p ON h.user_id = p.user_id
      WHERE p.user_id = auth.uid() AND h.awc_center = children.awc_center
    )
  );

-- Health records policies
CREATE POLICY "Admins can view all health records"
  ON public.health_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Healthworkers can manage health records for their AWC children"
  ON public.health_records FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.healthworkers h
      JOIN public.profiles p ON h.user_id = p.user_id
      JOIN public.children c ON c.awc_center = h.awc_center
      WHERE p.user_id = auth.uid() AND c.id = health_records.child_id
    )
  );

-- Create function to update child status based on latest health record
CREATE OR REPLACE FUNCTION public.update_child_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.children
  SET current_status = NEW.predicted_status,
      updated_at = now()
  WHERE id = NEW.child_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating child status
DROP TRIGGER IF EXISTS update_child_status_trigger ON public.health_records;
CREATE TRIGGER update_child_status_trigger
  AFTER INSERT ON public.health_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_child_status();