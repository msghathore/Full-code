import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  category: string;
  tags: string[];
  likes: number;
  views: number;
  is_sticky: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  replies_count?: number;
  replies?: ForumReply[];
}

export interface ForumReply {
  id: string;
  post_id: string;
  content: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  likes: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

export interface CreateReplyData {
  post_id: string;
  content: string;
}

class ForumService {
  // Get all forum posts with optional filtering
  async getPosts(category?: string, limit = 50, offset = 0): Promise<ForumPost[]> {
    let query = supabase
      .from('forum_posts')
      .select(`
        *,
        replies:forum_replies(count)
      `)
      .eq('is_published', true)
      .order('is_sticky', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching forum posts:', error);
      throw error;
    }

    // Transform the data to include replies_count
    return (data || []).map(post => ({
      ...post,
      replies_count: post.replies?.[0]?.count || 0,
      replies: undefined // Remove the replies array from the main post
    }));
  }

  // Get a single post with its replies
  async getPostById(id: string): Promise<ForumPost | null> {
    // First increment views
    await supabase.rpc('increment_post_views', { post_uuid: id });

    // Then fetch the post with replies
    const { data: post, error: postError } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single();

    if (postError) {
      console.error('Error fetching forum post:', postError);
      throw postError;
    }

    // Fetch replies
    const { data: replies, error: repliesError } = await supabase
      .from('forum_replies')
      .select('*')
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    if (repliesError) {
      console.error('Error fetching replies:', repliesError);
      throw repliesError;
    }

    return {
      ...post,
      replies_count: replies?.length || 0,
      replies: replies || []
    };
  }

  // Create a new post
  async createPost(postData: CreatePostData): Promise<ForumPost> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User must be authenticated to create posts');
    }

    // Get user profile data from Clerk
    const userData = {
      author_id: user.id,
      author_name: user.user_metadata?.full_name || user.email_addresses?.[0]?.email_address || 'Anonymous',
      author_avatar: user.image_url || undefined
    };

    const { data, error } = await supabase
      .from('forum_posts')
      .insert({
        ...postData,
        ...userData
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating forum post:', error);
      throw error;
    }

    return {
      ...data,
      replies_count: 0,
      replies: []
    };
  }

  // Create a reply
  async createReply(replyData: CreateReplyData): Promise<ForumReply> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User must be authenticated to create replies');
    }

    const userData = {
      author_id: user.id,
      author_name: user.user_metadata?.full_name || user.email_addresses?.[0]?.email_address || 'Anonymous',
      author_avatar: user.image_url || undefined
    };

    const { data, error } = await supabase
      .from('forum_replies')
      .insert({
        ...replyData,
        ...userData
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating forum reply:', error);
      throw error;
    }

    return data;
  }

  // Toggle like on a post
  async togglePostLike(postId: string): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User must be authenticated to like posts');
    }

    const { data, error } = await supabase.rpc('toggle_post_like', {
      post_uuid: postId,
      user_uuid: user.id
    });

    if (error) {
      console.error('Error toggling post like:', error);
      throw error;
    }

    return data;
  }

  // Toggle like on a reply
  async toggleReplyLike(replyId: string): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User must be authenticated to like replies');
    }

    const { data, error } = await supabase.rpc('toggle_reply_like', {
      reply_uuid: replyId,
      user_uuid: user.id
    });

    if (error) {
      console.error('Error toggling reply like:', error);
      throw error;
    }

    return data;
  }

  // Delete a post (only by author)
  async deletePost(postId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User must be authenticated to delete posts');
    }

    const { error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', postId)
      .eq('author_id', user.id);

    if (error) {
      console.error('Error deleting forum post:', error);
      throw error;
    }
  }

  // Delete a reply (only by author)
  async deleteReply(replyId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User must be authenticated to delete replies');
    }

    const { error } = await supabase
      .from('forum_replies')
      .delete()
      .eq('id', replyId)
      .eq('author_id', user.id);

    if (error) {
      console.error('Error deleting forum reply:', error);
      throw error;
    }
  }

  // Get categories
  getCategories(): string[] {
    return ['All', 'Skincare', 'Hair Care', 'Nail Care', 'Makeup', 'General'];
  }
}

export const forumService = new ForumService();

// Helper functions for formatting
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return date.toLocaleDateString();
};

export const formatJoinDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMonths = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30));

  if (diffInMonths < 1) return 'Less than a month ago';
  if (diffInMonths < 12) return `${diffInMonths} months ago`;

  const years = Math.floor(diffInMonths / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
};