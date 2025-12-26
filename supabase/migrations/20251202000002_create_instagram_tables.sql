-- Create instagram_posts table
CREATE TABLE IF NOT EXISTS public.instagram_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    caption TEXT,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create instagram_stories table
CREATE TABLE IF NOT EXISTS public.instagram_stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    username TEXT NOT NULL,
    is_viewed BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_instagram_posts_created_at ON public.instagram_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_is_published ON public.instagram_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_instagram_stories_expires_at ON public.instagram_stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_instagram_stories_is_active ON public.instagram_stories(is_active);

-- Enable Row Level Security
ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_stories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for instagram_posts
DROP POLICY IF EXISTS "Anyone can view published instagram posts" ON public.instagram_posts;
CREATE POLICY "Anyone can view published instagram posts" ON public.instagram_posts
    FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Authenticated users can insert instagram posts" ON public.instagram_posts;
CREATE POLICY "Authenticated users can insert instagram posts" ON public.instagram_posts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own instagram posts" ON public.instagram_posts;
CREATE POLICY "Users can update their own instagram posts" ON public.instagram_posts
    FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete their own instagram posts" ON public.instagram_posts;
CREATE POLICY "Users can delete their own instagram posts" ON public.instagram_posts
    FOR DELETE USING (auth.uid() = created_by);

-- Create RLS policies for instagram_stories
DROP POLICY IF EXISTS "Anyone can view active instagram stories" ON public.instagram_stories;
CREATE POLICY "Anyone can view active instagram stories" ON public.instagram_stories
    FOR SELECT USING (is_active = true AND expires_at > NOW());

DROP POLICY IF EXISTS "Authenticated users can insert instagram stories" ON public.instagram_stories;
CREATE POLICY "Authenticated users can insert instagram stories" ON public.instagram_stories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own instagram stories" ON public.instagram_stories;
CREATE POLICY "Users can update their own instagram stories" ON public.instagram_stories
    FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete their own instagram stories" ON public.instagram_stories;
CREATE POLICY "Users can delete their own instagram stories" ON public.instagram_stories
    FOR DELETE USING (auth.uid() = created_by);

-- Insert some sample data
INSERT INTO public.instagram_posts (image_url, caption, likes, comments, timestamp) VALUES
('/images/client-1.jpg', '✨ Amazing transformation with our new facial treatment! Book your session today 💫 #ZaviraBeauty #Skincare', 1247, 89, NOW() - INTERVAL '2 hours'),
('/images/client-2.jpg', 'Behind the scenes: Our expert stylists creating magic! What''s your favorite service? 💄 #BeautySalon #Zavira', 892, 56, NOW() - INTERVAL '4 hours'),
('/images/client-3.jpg', 'Nail art perfection! Our technicians are true artists 🎨 #Manicure #ZaviraNails', 654, 34, NOW() - INTERVAL '6 hours')
ON CONFLICT DO NOTHING;

INSERT INTO public.instagram_stories (image_url, username, is_viewed) VALUES
('/images/client-1.jpg', 'zavira_beauty', false),
('/images/client-2.jpg', 'zavira_tips', true),
('/images/client-3.jpg', 'zavira_deals', false)
ON CONFLICT DO NOTHING;