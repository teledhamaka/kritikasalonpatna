-- Fix Supabase Auth Issues
-- Run these commands in your Supabase SQL Editor

-- 1. First, clean up any old, conflicting triggers from the auth schema
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Temporarily disable RLS on profiles to make schema changes
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. Drop existing triggers on profiles before dropping the table
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_profile_age ON public.profiles;
DROP TRIGGER IF EXISTS trigger_handle_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS trigger_handle_age_calculation ON public.profiles;

-- 4. Create a function to update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create a function to calculate age from birthday
CREATE OR REPLACE FUNCTION handle_age_calculation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.birthday IS NOT NULL THEN
    NEW.age = EXTRACT(YEAR FROM AGE(NEW.birthday))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Recreate the profiles table with a clean structure
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL CHECK (length(trim(full_name)) > 0),
  email TEXT NOT NULL UNIQUE CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone TEXT,
  birthday DATE,
  age INTEGER CHECK (age >= 0 AND age <= 150),
  anniversary_date DATE,
  theme_style TEXT DEFAULT 'pink' CHECK (theme_style IN ('pink', 'purple', 'blue', 'green', 'gold')),
  enable_period_tracker BOOLEAN DEFAULT false,
  login_count INTEGER DEFAULT 0 CHECK (login_count >= 0),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Create indexes for better performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);

-- 8. Create triggers for the 'profiles' table
-- This trigger updates the 'updated_at' column on any row update
CREATE TRIGGER trigger_handle_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- This trigger calculates the 'age' whenever the 'birthday' is inserted or updated
CREATE TRIGGER trigger_handle_age_calculation
  BEFORE INSERT OR UPDATE OF birthday ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_age_calculation();

-- 9. (IMPORTANT) Create the function and trigger to auto-create a profile
-- This function will be called by the trigger below
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- This trigger calls the function after a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Re-enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 11. Create RLS policies
-- Users can see their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can insert their own profile (this is needed for the trigger)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 12. Grant permissions to roles
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;