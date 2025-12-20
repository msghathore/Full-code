import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Upload, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';
import type { Tables } from '@/integrations/supabase/types';

type UGCPost = Tables<'ugc_posts'>;

export const UGCGallery = () => {
  const [posts, setPosts] = useState<UGCPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPost, setNewPost] = useState({
    image: '',
    caption: '',
    author: '',
    tags: ''
  });
  const { toast } = useToast();
  const { user, isSignedIn } = useUser();

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ugc_posts')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        toast({
          title: "Error",
          description: "Failed to load posts. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewPost(prev => ({ ...prev, image: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPost = async () => {
    if (!isSignedIn) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to share your story.",
        variant: "destructive",
      });
      return;
    }

    if (!newPost.image || !newPost.caption || !newPost.author) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const tagsArray = newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      const { data, error } = await supabase
        .from('ugc_posts')
        .insert({
          image_url: newPost.image,
          caption: newPost.caption,
          author_name: newPost.author,
          author_email: user?.primaryEmailAddress?.emailAddress || null,
          tags: tagsArray,
          created_by: user?.id || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        toast({
          title: "Error",
          description: "Failed to submit your post. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Add the new post to the local state
      setPosts(prev => [data, ...prev]);
      setNewPost({ image: '', caption: '', author: '', tags: '' });
      setIsSubmitDialogOpen(false);

      toast({
        title: "Post Submitted!",
        description: "Your photo has been added to the gallery.",
      });
    } catch (error) {
      console.error('Error submitting post:', error);
      toast({
        title: "Error",
        description: "Failed to submit your post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      // Optimistically update UI
      setPosts(prev => prev.map(post =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      ));

      const { error } = await supabase
        .from('ugc_posts')
        .update({ likes: posts.find(p => p.id === postId)?.likes! + 1 })
        .eq('id', postId);

      if (error) {
        console.error('Error liking post:', error);
        // Revert optimistic update on error
        setPosts(prev => prev.map(post =>
          post.id === postId ? { ...post, likes: post.likes - 1 } : post
        ));
        toast({
          title: "Error",
          description: "Failed to like post. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert optimistic update on error
      setPosts(prev => prev.map(post =>
        post.id === postId ? { ...post, likes: post.likes - 1 } : post
      ));
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif text-white mb-2">Community Gallery</h2>
          <p className="text-gray-300">Share your beauty transformations and inspire others</p>
        </div>

        {isSignedIn ? (
          <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-600 hover:to-amber-700">
                <Upload className="w-4 h-4 mr-2" />
                Share Your Story
              </Button>
            </DialogTrigger>
          <DialogContent className="bg-black/90 border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Share Your Beauty Transformation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload Photo *
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="bg-black/50 border-white/10 text-white"
                />
                {newPost.image && (
                  <div className="mt-2 relative">
                    <img
                      src={newPost.image}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded"
                    />
                    <button
                      onClick={() => setNewPost(prev => ({ ...prev, image: '' }))}
                      className="absolute top-1 right-1 bg-red-500 rounded-full p-1"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name *
                </label>
                <Input
                  value={newPost.author}
                  onChange={(e) => setNewPost(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Enter your name"
                  className="bg-black/50 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Caption *
                </label>
                <Textarea
                  value={newPost.caption}
                  onChange={(e) => setNewPost(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="Tell us about your experience..."
                  className="bg-black/50 border-white/10 text-white"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags (comma separated)
                </label>
                <Input
                  value={newPost.tags}
                  onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g., facial, skincare, transformation"
                  className="bg-black/50 border-white/10 text-white"
                />
              </div>

              <Button
                onClick={handleSubmitPost}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-600 hover:to-amber-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  'Share Post'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        ) : (
          <Button
            className="bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-600 hover:to-amber-700"
            onClick={() => {
              toast({
                title: "Sign In Required",
                description: "Please sign in to share your beauty transformation.",
                variant: "destructive",
              });
            }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Share Your Story
          </Button>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
            <span className="ml-2 text-gray-300">Loading posts...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400 text-lg">No posts yet. Be the first to share your beauty transformation!</p>
          </div>
        ) : (
          posts.map((post) => (
          <Card key={post.id} className="bg-black/50 border-white/10 overflow-hidden group hover:border-pink-500/50 transition-all">
            <div className="relative">
              <img
                src={post.image_url}
                alt="User submitted"
                className="w-full h-64 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                onClick={() => setSelectedImage(post.image_url)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{post.author_name}</span>
                <span className="text-gray-400 text-sm">
                  {new Date(post.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>

              {post.caption && (
                <p className="text-white text-sm mb-3 line-clamp-2">{post.caption}</p>
              )}

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs bg-pink-500/20 text-pink-400">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center space-x-1 text-gray-400 hover:text-pink-500 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{post.likes || 0}</span>
                  </button>
                  <div className="flex items-center space-x-1 text-gray-400">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{post.comments || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-black/50 rounded-full p-2 text-white hover:bg-black/70"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};