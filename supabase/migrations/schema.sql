-- ###########################################################
-- ALUMNI PORTAL DATABASE SCHEMA
-- University Theme: Maroon (#800000) & Blue (#002147)
-- ###########################################################

-- 1. Create the Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name TEXT NOT NULL,
  degree TEXT,
  graduation_year INT,
  email TEXT,
  contact_number TEXT,
  job_title TEXT,
  company TEXT,
  career_path TEXT,
  feedback TEXT,
  interested_in_events BOOLEAN DEFAULT FALSE,
  avatar_url TEXT, -- Path to photo in Supabase Storage
  is_verified BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'alumni' CHECK (role IN ('alumni', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- Allow anyone to read VERIFIED profiles (for the Directory)
CREATE POLICY "Verified profiles are public" 
ON public.profiles FOR SELECT 
USING (is_verified = true);

-- Allow Admins to see ALL profiles (verified or not)
CREATE POLICY "Admins have full access" 
ON public.profiles FOR ALL 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Allow users to update their own profile data
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Automated Profile Creation on Signup
-- This function runs every time a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    degree, 
    graduation_year, 
    email, 
    contact_number, 
    job_title, 
    company, 
    career_path, 
    feedback, 
    interested_in_events
  )
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'degree',
    (new.raw_user_meta_data->>'graduation_year')::int,
    new.email,
    new.raw_user_meta_data->>'contact_number',
    new.raw_user_meta_data->>'job_title',
    new.raw_user_meta_data->>'company',
    new.raw_user_meta_data->>'career_path',
    new.raw_user_meta_data->>'feedback',
    (new.raw_user_meta_data->>'interested_in_events')::boolean
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Helpful Indexes for Search Performance
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_degree ON public.profiles (degree);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON public.profiles (company);

-- 6. Grant Permissions
GRANT ALL ON TABLE public.profiles TO postgres;
GRANT ALL ON TABLE public.profiles TO service_role;
GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;