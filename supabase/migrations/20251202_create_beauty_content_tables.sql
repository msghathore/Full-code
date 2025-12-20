-- Create beauty tips and video tutorials tables

-- Beauty tips table
CREATE TABLE IF NOT EXISTS public.beauty_tips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    read_time INTEGER DEFAULT 5,
    likes INTEGER DEFAULT 0,
    image_url TEXT,
    video_url TEXT,
    tags TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Video tutorials table
CREATE TABLE IF NOT EXISTS public.video_tutorials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    duration VARCHAR(20),
    author VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    video_url TEXT NOT NULL,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_beauty_tips_category ON public.beauty_tips(category);
CREATE INDEX IF NOT EXISTS idx_beauty_tips_is_published ON public.beauty_tips(is_published);
CREATE INDEX IF NOT EXISTS idx_beauty_tips_created_at ON public.beauty_tips(created_at);
CREATE INDEX IF NOT EXISTS idx_beauty_tips_created_by ON public.beauty_tips(created_by);

CREATE INDEX IF NOT EXISTS idx_video_tutorials_category ON public.video_tutorials(category);
CREATE INDEX IF NOT EXISTS idx_video_tutorials_is_published ON public.video_tutorials(is_published);
CREATE INDEX IF NOT EXISTS idx_video_tutorials_created_at ON public.video_tutorials(created_at);
CREATE INDEX IF NOT EXISTS idx_video_tutorials_created_by ON public.video_tutorials(created_by);

-- Enable Row Level Security
ALTER TABLE public.beauty_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_tutorials ENABLE ROW LEVEL SECURITY;

-- Create policies for Row Level Security
-- Allow everyone to view published beauty tips
CREATE POLICY "Allow everyone to view published beauty tips" ON public.beauty_tips
    FOR SELECT USING (is_published = true);

-- Allow authenticated users to insert beauty tips
CREATE POLICY "Allow authenticated users to create beauty tips" ON public.beauty_tips
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update beauty tips they created or all if admin
CREATE POLICY "Allow authenticated users to update beauty tips" ON public.beauty_tips
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND (
            created_by = auth.uid() OR
            auth.jwt() ->> 'role' = 'admin'
        )
    );

-- Allow authenticated users to delete beauty tips they created or all if admin
CREATE POLICY "Allow authenticated users to delete beauty tips" ON public.beauty_tips
    FOR DELETE USING (
        auth.role() = 'authenticated' AND (
            created_by = auth.uid() OR
            auth.jwt() ->> 'role' = 'admin'
        )
    );

-- Allow everyone to view published video tutorials
CREATE POLICY "Allow everyone to view published video tutorials" ON public.video_tutorials
    FOR SELECT USING (is_published = true);

-- Allow authenticated users to insert video tutorials
CREATE POLICY "Allow authenticated users to create video tutorials" ON public.video_tutorials
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update video tutorials they created or all if admin
CREATE POLICY "Allow authenticated users to update video tutorials" ON public.video_tutorials
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND (
            created_by = auth.uid() OR
            auth.jwt() ->> 'role' = 'admin'
        )
    );

-- Allow authenticated users to delete video tutorials they created or all if admin
CREATE POLICY "Allow authenticated users to delete video tutorials" ON public.video_tutorials
    FOR DELETE USING (
        auth.role() = 'authenticated' AND (
            created_by = auth.uid() OR
            auth.jwt() ->> 'role' = 'admin'
        )
    );

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_beauty_tips_updated_at
    BEFORE UPDATE ON public.beauty_tips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_tutorials_updated_at
    BEFORE UPDATE ON public.video_tutorials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();