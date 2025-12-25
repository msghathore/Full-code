import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageCircle, ThumbsUp, Eye, Clock, User, Plus, Reply, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/clerk-react';
import { forumService, formatTimeAgo, ForumPost, ForumReply } from '@/services/forumService';

const categories = ['All', 'Skincare', 'Hair Care', 'Nail Care', 'Makeup', 'General'];

export const CommunityForum = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [isNewPostDialogOpen, setIsNewPostDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'General',
    tags: ''
  });
  const [newReply, setNewReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, isSignedIn } = useUser();

  // Load posts on component mount and when category changes
  useEffect(() => {
    loadPosts();
  }, [selectedCategory]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await forumService.getPosts(
        selectedCategory === 'All' ? undefined : selectedCategory
      );
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: "Error",
        description: "Failed to load forum posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts;

  const handleCreatePost = async () => {
    if (!isSignedIn) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a post.",
        variant: "destructive",
      });
      return;
    }

    if (!newPost.title || !newPost.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in title and content.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const postData = {
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const createdPost = await forumService.createPost(postData);
      setPosts(prev => [createdPost, ...prev]);
      setNewPost({ title: '', content: '', category: 'General', tags: '' });
      setIsNewPostDialogOpen(false);

      toast({
        title: "Post Created!",
        description: "Your discussion has been posted to the forum.",
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!isSignedIn) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like posts.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newLikes = await forumService.togglePostLike(postId);
      setPosts(prev => prev.map(post =>
        post.id === postId ? { ...post, likes: newLikes } : post
      ));

      // Update selected post if it's the one being liked
      if (selectedPost?.id === postId) {
        setSelectedPost(prev => prev ? { ...prev, likes: newLikes } : null);
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddReply = async (postId: string) => {
    if (!isSignedIn) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to reply.",
        variant: "destructive",
      });
      return;
    }

    if (!newReply.trim()) return;

    try {
      setSubmitting(true);
      const replyData = {
        post_id: postId,
        content: newReply
      };

      const createdReply = await forumService.createReply(replyData);

      // Update posts list
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? {
              ...post,
              replies_count: (post.replies_count || 0) + 1,
              replies: [...(post.replies || []), createdReply]
            }
          : post
      ));

      // Update selected post
      if (selectedPost?.id === postId) {
        setSelectedPost(prev => prev ? {
          ...prev,
          replies_count: (prev.replies_count || 0) + 1,
          replies: [...(prev.replies || []), createdReply]
        } : null);
      }

      setNewReply('');
      toast({
        title: "Reply Added!",
        description: "Your reply has been posted.",
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: "Error",
        description: "Failed to add reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostClick = async (post: ForumPost) => {
    try {
      const fullPost = await forumService.getPostById(post.id);
      setSelectedPost(fullPost);
    } catch (error) {
      console.error('Error loading post details:', error);
      toast({
        title: "Error",
        description: "Failed to load post details. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif text-white mb-2">Community Forum</h2>
          <p className="text-gray-300">Discuss beauty topics, ask questions, and connect with fellow beauty enthusiasts</p>
        </div>

        <Dialog open={isNewPostDialogOpen} onOpenChange={setIsNewPostDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-red-500 to-amber-600 hover:from-red-600 hover:to-amber-700">
              <Plus className="w-4 h-4 mr-2" />
              New Discussion
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black/90 border-white/10 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Start a New Discussion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <Input
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="What's your question or topic?"
                  className="bg-black/50 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white"
                >
                  {categories.slice(1).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content *
                </label>
                <Textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Share your thoughts, ask questions, or start a discussion..."
                  className="bg-black/50 border-white/10 text-white"
                  rows={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags (comma separated)
                </label>
                <Input
                  value={newPost.tags}
                  onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g., skincare, routine, products"
                  className="bg-black/50 border-white/10 text-white"
                />
              </div>

              <Button
                onClick={handleCreatePost}
                disabled={submitting}
                className="w-full bg-gradient-to-r from-red-500 to-amber-600 hover:from-red-600 hover:to-amber-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post Discussion'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category
              ? "bg-pink-500 hover:bg-pink-600"
              : "border-gray-600 text-gray-300 hover:border-pink-500"
            }
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
            <span className="ml-2 text-gray-300">Loading posts...</span>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No posts yet</h3>
            <p className="text-gray-500">Be the first to start a discussion!</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <Card
              key={post.id}
              className={`bg-black/50 border-white/10 hover:border-pink-500/50 transition-all cursor-pointer ${
                post.is_sticky ? 'border-l-4 border-l-yellow-500' : ''
              }`}
              onClick={() => handlePostClick(post)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={post.author_avatar || undefined} />
                    <AvatarFallback>{post.author_name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {post.is_sticky && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                          Sticky
                        </Badge>
                      )}
                      <Badge className="bg-pink-500/20 text-pink-400">
                        {post.category}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-2 hover:text-pink-400 transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-gray-300 mb-3 line-clamp-2">{post.content}</p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-400">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span>By {post.author_name}</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(post.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{post.views || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.replies_count || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{post.likes || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 border border-white/10 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedPost.author_avatar || undefined} />
                    <AvatarFallback>{selectedPost.author_name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl font-serif text-white mb-2">{selectedPost.title}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-pink-500/20 text-pink-400">
                        {selectedPost.category}
                      </Badge>
                      {selectedPost.is_sticky && (
                        <Badge className="bg-yellow-500/20 text-yellow-400">
                          Sticky
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      By {selectedPost.author_name} • {formatTimeAgo(selectedPost.created_at)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="text-gray-300 mb-6 whitespace-pre-line">{selectedPost.content}</div>

              <div className="flex flex-wrap gap-2 mb-6">
                {selectedPost.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-gray-600 text-gray-400">
                    #{tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <Button
                  onClick={() => handleLikePost(selectedPost.id)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:border-pink-500"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Like ({selectedPost.likes || 0})
                </Button>
              </div>

              {/* Replies Section */}
              <div className="border-t border-gray-700 pt-6">
                <h4 className="text-lg font-semibold text-white mb-4">Replies ({selectedPost.replies_count || 0})</h4>

                <div className="space-y-4 mb-6">
                  {selectedPost.replies?.map((reply) => (
                    <div key={reply.id} className="flex space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={reply.author_avatar || undefined} />
                        <AvatarFallback>{reply.author_name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-white">{reply.author_name}</span>
                          <span className="text-xs text-gray-400">{formatTimeAgo(reply.created_at)}</span>
                        </div>
                        <p className="text-gray-300">{reply.content}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-pink-400">
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            {reply.likes || 0}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Reply */}
                <div className="flex space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{user?.firstName?.[0] || user?.username?.[0] || 'Y'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      placeholder="Write a reply..."
                      className="bg-black/50 border-white/10 text-white mb-2"
                      rows={3}
                    />
                    <Button
                      onClick={() => handleAddReply(selectedPost.id)}
                      disabled={submitting}
                      className="bg-pink-500 hover:bg-pink-600"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Replying...
                        </>
                      ) : (
                        <>
                          <Reply className="w-4 h-4 mr-2" />
                          Reply
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};