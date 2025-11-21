import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share, Bookmark } from 'lucide-react';

interface InstagramPost {
  id: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: string;
  isStory?: boolean;
}

interface InstagramStory {
  id: string;
  image: string;
  username: string;
  isViewed: boolean;
}

const mockPosts: InstagramPost[] = [
  {
    id: '1',
    image: '/images/client-1.jpg',
    caption: '✨ Amazing transformation with our new facial treatment! Book your session today 💫 #ZaviraBeauty #Skincare',
    likes: 1247,
    comments: 89,
    timestamp: '2h ago'
  },
  {
    id: '2',
    image: '/images/client-2.jpg',
    caption: 'Behind the scenes: Our expert stylists creating magic! What\'s your favorite service? 💄 #BeautySalon #Zavira',
    likes: 892,
    comments: 56,
    timestamp: '4h ago'
  },
  {
    id: '3',
    image: '/images/client-3.jpg',
    caption: 'Nail art perfection! Our technicians are true artists 🎨 #Manicure #ZaviraNails',
    likes: 654,
    comments: 34,
    timestamp: '6h ago'
  }
];

const mockStories: InstagramStory[] = [
  { id: '1', image: '/images/client-1.jpg', username: 'zavira_beauty', isViewed: false },
  { id: '2', image: '/images/client-2.jpg', username: 'zavira_tips', isViewed: true },
  { id: '3', image: '/images/client-3.jpg', username: 'zavira_deals', isViewed: false }
];

export const InstagramFeed = () => {
  const [posts] = useState<InstagramPost[]>(mockPosts);
  const [stories] = useState<InstagramStory[]>(mockStories);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-serif text-white mb-4">Follow Us on Instagram</h2>
        <p className="text-gray-300 mb-6">Stay updated with our latest beauty tips, client transformations, and exclusive offers</p>

        {/* Stories Section */}
        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
          {stories.map((story) => (
            <div
              key={story.id}
              className={`flex-shrink-0 w-16 h-16 rounded-full border-2 cursor-pointer transition-all hover:scale-105 ${
                story.isViewed ? 'border-gray-500' : 'border-pink-500'
              }`}
            >
              <img
                src={story.image}
                alt={story.username}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="bg-black/50 border-white/10 overflow-hidden group hover:border-pink-500/50 transition-all">
              <div className="relative">
                <img
                  src={post.image}
                  alt="Instagram post"
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <CardContent className="p-4">
                <p className="text-white text-sm mb-3 line-clamp-3">{post.caption}</p>

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
                  <span>{post.timestamp}</span>
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

        {/* Follow Button */}
        <div className="text-center mt-8">
          <a
            href="https://instagram.com/zavira_beauty"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            Follow @zavira_beauty
          </a>
        </div>
      </div>
    </div>
  );
};