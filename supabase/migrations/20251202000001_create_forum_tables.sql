-- Create forum_posts table
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  is_sticky BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_replies table
CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_likes table for tracking who liked what
CREATE TABLE IF NOT EXISTS forum_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, reply_id)
);

-- Enable RLS
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_posts
DROP POLICY IF EXISTS "Anyone can view published forum posts" ON forum_posts;
CREATE POLICY "Anyone can view published forum posts" ON forum_posts
  FOR SELECT USING (is_published = TRUE);

DROP POLICY IF EXISTS "Authenticated users can create forum posts" ON forum_posts;
CREATE POLICY "Authenticated users can create forum posts" ON forum_posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own posts" ON forum_posts;
CREATE POLICY "Users can update their own posts" ON forum_posts
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON forum_posts;
CREATE POLICY "Users can delete their own posts" ON forum_posts
  FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for forum_replies
DROP POLICY IF EXISTS "Anyone can view forum replies" ON forum_replies;
CREATE POLICY "Anyone can view forum replies" ON forum_replies
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can create forum replies" ON forum_replies;
CREATE POLICY "Authenticated users can create forum replies" ON forum_replies
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own replies" ON forum_replies;
CREATE POLICY "Users can update their own replies" ON forum_replies
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete their own replies" ON forum_replies;
CREATE POLICY "Users can delete their own replies" ON forum_replies
  FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for forum_likes
DROP POLICY IF EXISTS "Users can view their own likes" ON forum_likes;
CREATE POLICY "Users can view their own likes" ON forum_likes
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can create likes" ON forum_likes;
CREATE POLICY "Authenticated users can create likes" ON forum_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own likes" ON forum_likes;
CREATE POLICY "Users can delete their own likes" ON forum_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_post_id ON forum_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_created_at ON forum_replies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_likes_user_id ON forum_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_post_id ON forum_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_reply_id ON forum_likes(reply_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_forum_posts_updated_at ON forum_posts;
CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_forum_replies_updated_at ON forum_replies;
CREATE TRIGGER update_forum_replies_updated_at
  BEFORE UPDATE ON forum_replies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment post views
CREATE OR REPLACE FUNCTION increment_post_views(post_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_posts
  SET views = views + 1
  WHERE id = post_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle likes on posts
CREATE OR REPLACE FUNCTION toggle_post_like(post_uuid UUID, user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  like_exists BOOLEAN;
  current_likes INTEGER;
BEGIN
  -- Check if like exists
  SELECT EXISTS(
    SELECT 1 FROM forum_likes
    WHERE post_id = post_uuid AND user_id = user_uuid
  ) INTO like_exists;

  IF like_exists THEN
    -- Remove like
    DELETE FROM forum_likes
    WHERE post_id = post_uuid AND user_id = user_uuid;

    UPDATE forum_posts
    SET likes = likes - 1
    WHERE id = post_uuid
    RETURNING likes INTO current_likes;
  ELSE
    -- Add like
    INSERT INTO forum_likes (user_id, post_id)
    VALUES (user_uuid, post_uuid);

    UPDATE forum_posts
    SET likes = likes + 1
    WHERE id = post_uuid
    RETURNING likes INTO current_likes;
  END IF;

  RETURN current_likes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle likes on replies
CREATE OR REPLACE FUNCTION toggle_reply_like(reply_uuid UUID, user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  like_exists BOOLEAN;
  current_likes INTEGER;
BEGIN
  -- Check if like exists
  SELECT EXISTS(
    SELECT 1 FROM forum_likes
    WHERE reply_id = reply_uuid AND user_id = user_uuid
  ) INTO like_exists;

  IF like_exists THEN
    -- Remove like
    DELETE FROM forum_likes
    WHERE reply_id = reply_uuid AND user_id = user_uuid;

    UPDATE forum_replies
    SET likes = likes - 1
    WHERE id = reply_uuid
    RETURNING likes INTO current_likes;
  ELSE
    -- Add like
    INSERT INTO forum_likes (user_id, reply_id)
    VALUES (user_uuid, reply_uuid);

    UPDATE forum_replies
    SET likes = likes + 1
    WHERE id = reply_uuid
    RETURNING likes INTO current_likes;
  END IF;

  RETURN current_likes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;