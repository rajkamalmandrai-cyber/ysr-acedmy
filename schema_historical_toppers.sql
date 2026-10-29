-- ==============================================================================
-- YSR ACADEMY: HISTORICAL COURSE TOPPERS - SUPABASE SCHEMA & POLICIES
-- ==============================================================================

-- 1. Create dedicated table for Historical Course Toppers
CREATE TABLE IF NOT EXISTS public.historical_course_toppers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name TEXT NOT NULL,
    course_name TEXT NOT NULL,
    subject TEXT,
    academic_year TEXT NOT NULL,
    achievement TEXT NOT NULL,
    photo_url TEXT,
    photo_path TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes for fast retrieval by course and status
CREATE INDEX IF NOT EXISTS idx_historical_toppers_lookup
ON public.historical_course_toppers (course_name, is_active, display_order, academic_year DESC);

-- 3. Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_historical_toppers_updated_at ON public.historical_course_toppers;
CREATE TRIGGER trigger_historical_toppers_updated_at
BEFORE UPDATE ON public.historical_course_toppers
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.historical_course_toppers ENABLE ROW LEVEL SECURITY;

-- 5. RLS Table Policies
-- PUBLIC: Can read only active records
DROP POLICY IF EXISTS "Public Read Active Historical Toppers" ON public.historical_course_toppers;
CREATE POLICY "Public Read Active Historical Toppers"
ON public.historical_course_toppers
FOR SELECT
USING (is_active = true);

-- ADMIN: Authenticated admins can view all records (including inactive)
DROP POLICY IF EXISTS "Admin Select All Historical Toppers" ON public.historical_course_toppers;
CREATE POLICY "Admin Select All Historical Toppers"
ON public.historical_course_toppers
FOR SELECT
TO authenticated
USING (
    auth.jwt() ->> 'email' IN ('rajkamalmandrai@gmail.com', 'ysracademy@gmail.com')
);

-- ADMIN: Authenticated admins can insert records
DROP POLICY IF EXISTS "Admin Insert Historical Toppers" ON public.historical_course_toppers;
CREATE POLICY "Admin Insert Historical Toppers"
ON public.historical_course_toppers
FOR INSERT
TO authenticated
WITH CHECK (
    auth.jwt() ->> 'email' IN ('rajkamalmandrai@gmail.com', 'ysracademy@gmail.com')
);

-- ADMIN: Authenticated admins can update records
DROP POLICY IF EXISTS "Admin Update Historical Toppers" ON public.historical_course_toppers;
CREATE POLICY "Admin Update Historical Toppers"
ON public.historical_course_toppers
FOR UPDATE
TO authenticated
USING (
    auth.jwt() ->> 'email' IN ('rajkamalmandrai@gmail.com', 'ysracademy@gmail.com')
)
WITH CHECK (
    auth.jwt() ->> 'email' IN ('rajkamalmandrai@gmail.com', 'ysracademy@gmail.com')
);

-- ADMIN: Authenticated admins can delete records
DROP POLICY IF EXISTS "Admin Delete Historical Toppers" ON public.historical_course_toppers;
CREATE POLICY "Admin Delete Historical Toppers"
ON public.historical_course_toppers
FOR DELETE
TO authenticated
USING (
    auth.jwt() ->> 'email' IN ('rajkamalmandrai@gmail.com', 'ysracademy@gmail.com')
);

-- ==============================================================================
-- STORAGE BUCKET CONFIGURATION & POLICIES
-- ==============================================================================

-- 6. Create dedicated Storage bucket: historical-course-topper-photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('historical-course-topper-photos', 'historical-course-topper-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Storage Policies on storage.objects
-- PUBLIC: Can view all photos in this bucket
DROP POLICY IF EXISTS "Public Access Historical Topper Photos" ON storage.objects;
CREATE POLICY "Public Access Historical Topper Photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'historical-course-topper-photos');

-- ADMIN: Authenticated admins can upload photos
DROP POLICY IF EXISTS "Admin Insert Historical Topper Photos" ON storage.objects;
CREATE POLICY "Admin Insert Historical Topper Photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'historical-course-topper-photos'
    AND auth.jwt() ->> 'email' IN ('rajkamalmandrai@gmail.com', 'ysracademy@gmail.com')
);
-- ADMIN: Authenticated admins can update/replace photos
DROP POLICY IF EXISTS "Admin Update Historical Topper Photos" ON storage.objects;
CREATE POLICY "Admin Update Historical Topper Photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'historical-course-topper-photos'
    AND auth.jwt() ->> 'email' IN ('rajkamalmandrai@gmail.com', 'ysracademy@gmail.com')
);
-- ADMIN: Authenticated admins can delete photos
DROP POLICY IF EXISTS "Admin Delete Historical Topper Photos" ON storage.objects;
CREATE POLICY "Admin Delete Historical Topper Photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'historical-course-topper-photos'
    AND auth.jwt() ->> 'email' IN ('rajkamalmandrai@gmail.com', 'ysracademy@gmail.com')
);
