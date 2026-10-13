-- ========================================================================
-- FORMA 3D — DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50) DEFAULT '1.0.0',
    content JSONB NOT NULL,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for speedy querying by owner
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON public.projects(updated_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 4. RLS Security Policies: Isolated per authenticated user

-- Policy: Users can select only their own projects
CREATE POLICY "Users can view own projects" 
    ON public.projects 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy: Users can insert projects only with their own user_id
CREATE POLICY "Users can insert own projects" 
    ON public.projects 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own projects
CREATE POLICY "Users can update own projects" 
    ON public.projects 
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete only their own projects
CREATE POLICY "Users can delete own projects" 
    ON public.projects 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_projects_updated
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
