import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UGCPost {
  id: string;
  image: string;
  caption: string;
  author: string;
  likes: number;
  comments: number;
  timestamp: string;
  tags: string[];
}

const mockUGCPosts: UGCPost[] = [
  {
    id: '1',
    image: '/images/client-1.jpg',
    caption: 'Amazing results from my facial treatment at Zavira! The team is incredible 💫',
    author: 'Sarah M.',
    likes: 45,
    comments: 12,
    timestamp: '2 days ago',
    tags: ['facial', 'skincare', 'transformation']
  },
  {
    id: '2',
    image: '/images/client-2.jpg',
    caption: 'Love my new hairstyle! Thank you Zavira for the magic ✨',
    author: 'Emma L.',
    likes: 67,
    comments: 23,
    timestamp: '3 days ago',
    tags: ['haircut', 'styling', 'haircolor']
  },
  {
    id: '3',
    image: '/images/client-3.jpg',
    caption: 'Perfect manicure for my wedding day! So grateful for the attention to detail 💅',
    author: 'Jessica R.',
    likes: 89,
    comments: 34,
    timestamp: '1 week ago',
    tags: ['manicure', 'nails', 'wedding']
  },
  {
    id: '4',
    image: '/images/client-4.jpg',
    caption: 'Before and after my skincare journey. Zavira changed my life! 🌟',
    author: 'Maria G.',
    likes: 123,
    comments: 45,
    timestamp: '2 weeks ago',
    tags: ['skincare', 'transformation', 'glow']
  }
];

export const UGCGallery = () => {
  const [posts, setPosts] = useState<UGCPost[]>(mockUGCPosts);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    image: '',
    caption: '',
    author: '',
    tags: ''
  });
  const { toast } = useToast();

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

  const handleSubmitPost = () => {
    if (!newPost.image || !newPost.caption || !newPost.author) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const post: UGCPost = {
      id: Date.now().toString(),
      image: newPost.image,
      caption: newPost.caption,
      author: newPost.author,
      likes: 0,
      comments: 0,
      timestamp: 'Just now',
      tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    setPosts(prev => [post, ...prev]);
    setNewPost({ image: '', caption: '', author: '', tags: '' });
    setIsSubmitDialogOpen(false);

    toast({
      title: "Post Submitted!",
      description: "Your photo has been added to the gallery.",
    });
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post =>
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif text-white mb-2">Community Gallery</h2>
          <p className="text-gray-300">Share your beauty transformations and inspire others</p>
        </div>

        <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
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
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                Share Post
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="bg-black/50 border-white/10 overflow-hidden group hover:border-pink-500/50 transition-all">
            <div className="relative">
              <img
                src={post.image}
                alt="User submitted"
                className="w-full h-64 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                onClick={() => setSelectedImage(post.image)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{post.author}</span>
                <span className="text-gray-400 text-sm">{post.timestamp}</span>
              </div>

              <p className="text-white text-sm mb-3 line-clamp-2">{post.caption}</p>

              <div className="flex flex-wrap gap-1 mb-3">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-pink-500/20 text-pink-400">
                    #{tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center space-x-1 text-gray-400 hover:text-pink-500 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{post.likes}</span>
                  </button>
                  <div className="flex items-center space-x-1 text-gray-400">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{post.comments}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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