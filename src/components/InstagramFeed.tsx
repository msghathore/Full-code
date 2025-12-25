import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share, Bookmark, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type InstagramPost = Tables<'instagram_posts'>;
type InstagramStory = Tables<'instagram_stories'>;

export const InstagramFeed = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [stories, setStories] = useState<InstagramStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstagramData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch posts
        const { data: postsData, error: postsError } = await supabase
          .from('instagram_posts')
          .select('*')
          .eq('is_published', true)
          .order('timestamp', { ascending: false })
          .limit(10);

        if (postsError) throw postsError;

        // Fetch active stories
        const { data: storiesData, error: storiesError } = await supabase
          .from('instagram_stories')
          .select('*')
          .eq('is_active', true)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });

        if (storiesError) throw storiesError;

        setPosts(postsData || []);
        setStories(storiesData || []);
      } catch (err) {
        console.error('Error fetching Instagram data:', err);
        setError('Failed to load Instagram feed');
        // Set empty arrays to show "0" values as requested
        setPosts([]);
        setStories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInstagramData();
  }, []);

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          <span className="ml-2 text-gray-300">Loading Instagram feed...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-serif text-white mb-4">Follow Us on Instagram</h2>
        <p className="text-gray-300 mb-6">Stay updated with our latest beauty tips, client transformations, and exclusive offers</p>

        {/* Stories Section */}
        {stories.length > 0 && (
          <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
            {stories.map((story) => (
              <div
                key={story.id}
                className={`flex-shrink-0 w-16 h-16 rounded-full border-2 cursor-pointer transition-all hover:scale-105 ${
                  story.is_viewed ? 'border-gray-500' : 'border-pink-500'
                }`}
              >
                <img
                  src={story.image_url}
                  alt={story.username}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="bg-black/50 border-white/10 overflow-hidden group hover:border-pink-500/50 transition-all">
                <div className="relative">
                  <img
                    src={post.image_url}
                    alt="Instagram post"
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <CardContent className="p-4">
                  {post.caption && (
                    <p className="text-white text-sm mb-3 line-clamp-3">{post.caption}</p>
                  )}

                  <div className="flex items-center justify-between text-gray-400 text-xs mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.likes.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                    <span>{formatTimestamp(post.timestamp)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button className="text-gray-400 hover:text-pink-500 transition-colors">
                        <Heart className="w-5 h-5" />
                      </button>
                      <button className="text-gray-400 hover:text-pink-500 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                      </button>
                      <button className="text-gray-400 hover:text-pink-500 transition-colors">
                        <Share className="w-5 h-5" />
                      </button>
                    </div>
                    <button className="text-gray-400 hover:text-pink-500 transition-colors">
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No posts available at the moment</p>
            <div className="text-sm text-gray-500">
              <p>Likes: 0 | Comments: 0</p>
            </div>
          </div>
        )}

        {/* Follow Button */}
        <div className="text-center mt-8">
          <a
            href="https://instagram.com/zavira_beauty"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-amber-600 text-white rounded-full hover:from-red-600 hover:to-amber-700 transition-all transform hover:scale-105"
          >
            Follow @zavira_beauty
          </a>
        </div>
      </div>
    </div>
  );
};