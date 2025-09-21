-- Create database schema for malnutrition monitoring system

-- Create profiles table for users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'healthworker')),
  awc_center TEXT,
  username TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create healthworkers table
CREATE TABLE public.healthworkers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  awc_center TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create children table
CREATE TABLE public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  awc_center TEXT NOT NULL,
  guardian_name TEXT NOT NULL,
  healthworker_id UUID REFERENCES public.healthworkers(id),
  current_status TEXT DEFAULT 'normal' CHECK (current_status IN ('sam', 'mam', 'normal')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create health_records table
CREATE TABLE public.health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  height DECIMAL(5,2) NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  edema BOOLEAN DEFAULT false,
  poverty_index INTEGER CHECK (poverty_index >= 0 AND poverty_index <= 10),
  sanitation_index INTEGER CHECK (sanitation_index >= 0 AND sanitation_index <= 10),
  meals_per_day INTEGER CHECK (meals_per_day > 0),
  predicted_status TEXT NOT NULL CHECK (predicted_status IN ('sam', 'mam', 'normal')),
  sam_probability DECIMAL(5,4),
  mam_probability DECIMAL(5,4),
  normal_probability DECIMAL(5,4),
  recorded_by UUID REFERENCES public.healthworkers(id),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthworkers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

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
    )
  );

-- Healthworkers policies
CREATE POLICY "Admins can view all healthworkers"
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

CREATE POLICY "Healthworkers can view children in their AWC"
  ON public.children FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.healthworkers h
      JOIN public.profiles p ON h.user_id = p.user_id
      WHERE p.user_id = auth.uid() AND h.awc_center = children.awc_center
    )
  );

CREATE POLICY "Healthworkers can insert children in their AWC"
  ON public.children FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.healthworkers h
      JOIN public.profiles p ON h.user_id = p.user_id
      WHERE p.user_id = auth.uid() AND h.awc_center = children.awc_center
    )
  );

CREATE POLICY "Healthworkers can update children in their AWC"
  ON public.children FOR UPDATE
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

CREATE POLICY "Healthworkers can view health records for their AWC children"
  ON public.health_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.healthworkers h
      JOIN public.profiles p ON h.user_id = p.user_id
      JOIN public.children c ON c.awc_center = h.awc_center
      WHERE p.user_id = auth.uid() AND c.id = health_records.child_id
    )
  );

CREATE POLICY "Healthworkers can insert health records for their AWC children"
  ON public.health_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.healthworkers h
      JOIN public.profiles p ON h.user_id = p.user_id
      JOIN public.children c ON c.awc_center = h.awc_center
      WHERE p.user_id = auth.uid() AND c.id = health_records.child_id
    )
  );

CREATE POLICY "Healthworkers can update health records for their AWC children"
  ON public.health_records FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.healthworkers h
      JOIN public.profiles p ON h.user_id = p.user_id
      JOIN public.children c ON c.awc_center = h.awc_center
      WHERE p.user_id = auth.uid() AND c.id = health_records.child_id
    )
  );

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_healthworkers_updated_at
  BEFORE UPDATE ON public.healthworkers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON public.children
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

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

CREATE TRIGGER update_child_status_trigger
  AFTER INSERT ON public.health_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_child_status();