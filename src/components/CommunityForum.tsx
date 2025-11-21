import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageCircle, ThumbsUp, Eye, Clock, User, Plus, Reply } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    joinDate: string;
  };
  category: string;
  tags: string[];
  createdAt: string;
  likes: number;
  replies: number;
  views: number;
  isSticky?: boolean;
  repliesList?: ForumReply[];
}

interface ForumReply {
  id: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
  likes: number;
}

const mockPosts: ForumPost[] = [
  {
    id: '1',
    title: 'Best skincare routine for combination skin?',
    content: 'Hi everyone! I have combination skin - oily T-zone but dry cheeks. What products would you recommend for a daily routine? Currently using cetaphil cleanser but looking for something more effective.',
    author: {
      name: 'Sarah M.',
      avatar: '/images/client-1.jpg',
      joinDate: '2 months ago'
    },
    category: 'Skincare',
    tags: ['skincare', 'combination', 'routine', 'products'],
    createdAt: '2 hours ago',
    likes: 12,
    replies: 8,
    views: 156,
    repliesList: [
      {
        id: '1',
        content: 'I have the same skin type! Try the CeraVe moisturizer - it\'s great for combination skin.',
        author: { name: 'Emma L.', avatar: '/images/client-2.jpg' },
        createdAt: '1 hour ago',
        likes: 5
      }
    ]
  },
  {
    id: '2',
    title: 'Hair color maintenance tips?',
    content: 'Just got my hair colored and want to keep it vibrant. Any tips on how to prevent fading and maintain the color longer?',
    author: {
      name: 'Jessica R.',
      avatar: '/images/client-3.jpg',
      joinDate: '1 month ago'
    },
    category: 'Hair Care',
    tags: ['hair', 'color', 'maintenance', 'tips'],
    createdAt: '4 hours ago',
    likes: 8,
    replies: 15,
    views: 234,
    isSticky: true
  },
  {
    id: '3',
    title: 'Nail care after gel manicure?',
    content: 'Got my first gel manicure yesterday and my nails feel a bit dry. What\'s the best way to care for nails after gel removal?',
    author: {
      name: 'Maria G.',
      avatar: '/images/client-4.jpg',
      joinDate: '3 weeks ago'
    },
    category: 'Nail Care',
    tags: ['nails', 'gel', 'manicure', 'care'],
    createdAt: '6 hours ago',
    likes: 6,
    replies: 4,
    views: 89
  }
];

const categories = ['All', 'Skincare', 'Hair Care', 'Nail Care', 'Makeup', 'General'];

export const CommunityForum = () => {
  const [posts, setPosts] = useState<ForumPost[]>(mockPosts);
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
  const { toast } = useToast();

  const filteredPosts = selectedCategory === 'All'
    ? posts
    : posts.filter(post => post.category === selectedCategory);

  const handleCreatePost = () => {
    if (!newPost.title || !newPost.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in title and content.",
        variant: "destructive",
      });
      return;
    }

    const post: ForumPost = {
      id: Date.now().toString(),
      title: newPost.title,
      content: newPost.content,
      author: {
        name: 'You',
        joinDate: 'Just now'
      },
      category: newPost.category,
      tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      createdAt: 'Just now',
      likes: 0,
      replies: 0,
      views: 0,
      repliesList: []
    };

    setPosts(prev => [post, ...prev]);
    setNewPost({ title: '', content: '', category: 'General', tags: '' });
    setIsNewPostDialogOpen(false);

    toast({
      title: "Post Created!",
      description: "Your discussion has been posted to the forum.",
    });
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post =>
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const handleAddReply = (postId: string) => {
    if (!newReply.trim()) return;

    const reply: ForumReply = {
      id: Date.now().toString(),
      content: newReply,
      author: { name: 'You' },
      createdAt: 'Just now',
      likes: 0
    };

    setPosts(prev => prev.map(post =>
      post.id === postId
        ? {
            ...post,
            replies: post.replies + 1,
            repliesList: [...(post.repliesList || []), reply]
          }
        : post
    ));

    setNewReply('');
    toast({
      title: "Reply Added!",
      description: "Your reply has been posted.",
    });
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
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
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
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                Post Discussion
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
        {filteredPosts.map((post) => (
          <Card
            key={post.id}
            className={`bg-black/50 border-white/10 hover:border-pink-500/50 transition-all cursor-pointer ${
              post.isSticky ? 'border-l-4 border-l-yellow-500' : ''
            }`}
            onClick={() => setSelectedPost(post)}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {post.isSticky && (
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
                      <span>By {post.author.name}</span>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{post.createdAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.replies}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 border border-white/10 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedPost.author.avatar} />
                    <AvatarFallback>{selectedPost.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl font-serif text-white mb-2">{selectedPost.title}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-pink-500/20 text-pink-400">
                        {selectedPost.category}
                      </Badge>
                      {selectedPost.isSticky && (
                        <Badge className="bg-yellow-500/20 text-yellow-400">
                          Sticky
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      By {selectedPost.author.name} • {selectedPost.createdAt}
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
                  Like ({selectedPost.likes})
                </Button>
              </div>

              {/* Replies Section */}
              <div className="border-t border-gray-700 pt-6">
                <h4 className="text-lg font-semibold text-white mb-4">Replies ({selectedPost.replies})</h4>

                <div className="space-y-4 mb-6">
                  {selectedPost.repliesList?.map((reply) => (
                    <div key={reply.id} className="flex space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={reply.author.avatar} />
                        <AvatarFallback>{reply.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-white">{reply.author.name}</span>
                          <span className="text-xs text-gray-400">{reply.createdAt}</span>
                        </div>
                        <p className="text-gray-300">{reply.content}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-pink-400">
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            {reply.likes}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Reply */}
                <div className="flex space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>Y</AvatarFallback>
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
                      className="bg-pink-500 hover:bg-pink-600"
                    >
                      <Reply className="w-4 h-4 mr-2" />
                      Reply
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