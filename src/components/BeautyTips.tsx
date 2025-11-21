import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Clock, User, ThumbsUp } from 'lucide-react';

interface BeautyTip {
  id: string;
  title: string;
  description: string;
  content: string;
  author: string;
  category: string;
  readTime: number;
  likes: number;
  image: string;
  videoUrl?: string;
  tags: string[];
}

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  author: string;
  category: string;
  views: number;
  likes: number;
  videoUrl: string;
}

const mockTips: BeautyTip[] = [
  {
    id: '1',
    title: 'The Perfect Skincare Routine for Busy Professionals',
    description: 'Learn how to maintain healthy skin even with a hectic schedule',
    content: `Start your day with a gentle cleanser and follow with a lightweight moisturizer with SPF. In the evening, double cleanse to remove makeup and impurities, then apply a targeted treatment serum. Finish with a rich night cream to repair overnight.

Key steps:
1. Cleanse morning and night
2. Tone to balance pH
3. Treat with serums
4. Moisturize
5. Protect with SPF during the day

Remember: Consistency is more important than complexity. A simple routine done daily beats an elaborate one done occasionally.`,
    author: 'Dr. Sarah Chen',
    category: 'Skincare',
    readTime: 5,
    likes: 245,
    image: '/images/client-1.jpg',
    tags: ['skincare', 'routine', 'busy', 'professional']
  },
  {
    id: '2',
    title: 'Hair Care Tips for Color-Treated Hair',
    description: 'Keep your color vibrant and hair healthy after coloring',
    content: `Color-treated hair needs extra care to maintain vibrancy and prevent damage. Use sulfate-free shampoos and conditioners specifically formulated for color-treated hair. Apply a deep conditioning mask weekly, and use heat protectant before styling.

Essential tips:
• Wash with cool water to seal cuticle
• Use color-depositing conditioners
• Trim regularly to prevent split ends
• Limit heat styling
• Protect from chlorine and sun

Your color will last longer and your hair will stay healthier with proper care.`,
    author: 'Maria Rodriguez',
    category: 'Hair Care',
    readTime: 4,
    likes: 189,
    image: '/images/client-2.jpg',
    tags: ['hair', 'color', 'maintenance', 'care']
  },
  {
    id: '3',
    title: 'Nail Care Fundamentals Every Woman Should Know',
    description: 'Basic but essential tips for healthy, beautiful nails',
    content: `Healthy nails start with proper care and nutrition. Keep nails trimmed and filed, moisturize cuticles regularly, and protect nails from harsh chemicals. Eat a balanced diet rich in biotin, vitamin E, and protein for strong nail growth.

Daily care routine:
• Keep nails clean and dry
• Moisturize hands and nails
• Wear gloves when doing chores
• Avoid biting nails
• Use nail strengthener if needed

With consistent care, you'll have strong, beautiful nails that complement any look.`,
    author: 'Emma Thompson',
    category: 'Nail Care',
    readTime: 3,
    likes: 156,
    image: '/images/client-3.jpg',
    tags: ['nails', 'care', 'health', 'maintenance']
  }
];

const mockVideos: VideoTutorial[] = [
  {
    id: '1',
    title: 'Complete Makeup Tutorial for Beginners',
    description: 'Step-by-step guide to natural everyday makeup',
    thumbnail: '/images/client-1.jpg',
    duration: '15:30',
    author: 'Lisa Park',
    category: 'Makeup',
    views: 12500,
    likes: 892,
    videoUrl: '/videos/menu-reference.mp4'
  },
  {
    id: '2',
    title: 'Professional Hair Styling Techniques',
    description: 'Learn professional blow-drying and styling methods',
    thumbnail: '/images/client-2.jpg',
    duration: '22:45',
    author: 'David Kim',
    category: 'Hair Styling',
    views: 8900,
    likes: 654,
    videoUrl: '/videos/service-reference.mp4'
  },
  {
    id: '3',
    title: 'Advanced Skincare Massage Techniques',
    description: 'Facial massage methods for better product absorption',
    thumbnail: '/images/client-3.jpg',
    duration: '18:20',
    author: 'Dr. Sarah Chen',
    category: 'Skincare',
    views: 15600,
    likes: 1200,
    videoUrl: '/videos/hero-video.mp4'
  }
];

export const BeautyTips = () => {
  const [selectedTip, setSelectedTip] = useState<BeautyTip | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);

  const categories = ['All', 'Skincare', 'Hair Care', 'Nail Care', 'Makeup', 'Hair Styling'];

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-serif text-white mb-4">Beauty Tips & Tutorials</h2>
        <p className="text-gray-300">Expert advice, video tutorials, and beauty insights from our professionals</p>
      </div>

      <Tabs defaultValue="tips" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-black/50 border border-white/10">
          <TabsTrigger value="tips" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
            Written Tips
          </TabsTrigger>
          <TabsTrigger value="videos" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
            Video Tutorials
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tips" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTips.map((tip) => (
              <Card
                key={tip.id}
                className="bg-black/50 border-white/10 overflow-hidden group hover:border-pink-500/50 transition-all cursor-pointer"
                onClick={() => setSelectedTip(tip)}
              >
                <div className="relative">
                  <img
                    src={tip.image}
                    alt={tip.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-pink-500/20 text-pink-400">
                      {tip.category}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="text-white font-semibold mb-2 line-clamp-2">{tip.title}</h3>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{tip.description}</p>

                  <div className="flex items-center justify-between text-gray-400 text-xs">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{tip.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{tip.readTime} min read</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-1 text-gray-400">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm">{tip.likes}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {tip.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-400">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockVideos.map((video) => (
              <Card
                key={video.id}
                className="bg-black/50 border-white/10 overflow-hidden group hover:border-pink-500/50 transition-all cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-pink-500/20 text-pink-400">
                      {video.category}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="text-white font-semibold mb-2 line-clamp-2">{video.title}</h3>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{video.description}</p>

                  <div className="flex items-center justify-between text-gray-400 text-xs mb-3">
                    <span>{video.author}</span>
                    <span>{video.views.toLocaleString()} views</span>
                  </div>

                  <div className="flex items-center space-x-1 text-gray-400">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">{video.likes.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Tip Detail Modal */}
      {selectedTip && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 border border-white/10 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Badge className="bg-pink-500/20 text-pink-400 mb-2">
                    {selectedTip.category}
                  </Badge>
                  <h3 className="text-2xl font-serif text-white mb-2">{selectedTip.title}</h3>
                  <p className="text-gray-300 mb-4">{selectedTip.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>By {selectedTip.author}</span>
                    <span>{selectedTip.readTime} min read</span>
                    <span>{selectedTip.likes} likes</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTip(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <img
                src={selectedTip.image}
                alt={selectedTip.title}
                className="w-full h-64 object-cover rounded mb-6"
              />

              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 whitespace-pre-line">{selectedTip.content}</div>
              </div>

              <div className="flex flex-wrap gap-2 mt-6">
                {selectedTip.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-gray-600 text-gray-400">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 border border-white/10 rounded-lg max-w-4xl w-full max-h-[90vh]">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Badge className="bg-pink-500/20 text-pink-400 mb-2">
                    {selectedVideo.category}
                  </Badge>
                  <h3 className="text-2xl font-serif text-white mb-2">{selectedVideo.title}</h3>
                  <p className="text-gray-300 mb-4">{selectedVideo.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>By {selectedVideo.author}</span>
                    <span>{selectedVideo.views.toLocaleString()} views</span>
                    <span>{selectedVideo.likes.toLocaleString()} likes</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="aspect-video bg-black rounded">
                <video
                  controls
                  className="w-full h-full rounded"
                  poster={selectedVideo.thumbnail}
                >
                  <source src={selectedVideo.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};