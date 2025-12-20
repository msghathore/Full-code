import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Clock, User, ThumbsUp, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type BeautyTip = Tables<'beauty_tips'>;
type VideoTutorial = Tables<'video_tutorials'>;

export const BeautyTips = () => {
  const [selectedTip, setSelectedTip] = useState<BeautyTip | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);
  const [beautyTips, setBeautyTips] = useState<BeautyTip[]>([]);
  const [videoTutorials, setVideoTutorials] = useState<VideoTutorial[]>([]);
  const [loadingTips, setLoadingTips] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = ['All', 'Skincare', 'Hair Care', 'Nail Care', 'Makeup', 'Hair Styling'];

  // Fetch beauty tips
  useEffect(() => {
    const fetchBeautyTips = async () => {
      try {
        setLoadingTips(true);
        const { data, error } = await supabase
          .from('beauty_tips')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBeautyTips(data || []);
      } catch (err) {
        console.error('Error fetching beauty tips:', err);
        setError('Failed to load beauty tips');
        setBeautyTips([]);
      } finally {
        setLoadingTips(false);
      }
    };

    fetchBeautyTips();
  }, []);

  // Fetch video tutorials
  useEffect(() => {
    const fetchVideoTutorials = async () => {
      try {
        setLoadingVideos(true);
        const { data, error } = await supabase
          .from('video_tutorials')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setVideoTutorials(data || []);
      } catch (err) {
        console.error('Error fetching video tutorials:', err);
        setError('Failed to load video tutorials');
        setVideoTutorials([]);
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchVideoTutorials();
  }, []);

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
          {loadingTips ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
              <span className="ml-2 text-gray-300">Loading beauty tips...</span>
            </div>
          ) : beautyTips.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No beauty tips available yet.</p>
              <p className="text-gray-500 text-sm mt-2">Check back soon for expert advice!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {beautyTips.map((tip) => (
              <Card
                key={tip.id}
                className="bg-black/50 border-white/10 overflow-hidden group hover:border-pink-500/50 transition-all cursor-pointer"
                onClick={() => setSelectedTip(tip)}
              >
                <div className="relative">
                   <img
                     src={tip.image_url || '/images/placeholder.jpg'}
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
                   <p className="text-gray-300 text-sm mb-3 line-clamp-2">{tip.description || 'No description available'}</p>

                   <div className="flex items-center justify-between text-gray-400 text-xs">
                     <div className="flex items-center space-x-1">
                       <User className="w-3 h-3" />
                       <span>{tip.author}</span>
                     </div>
                     <div className="flex items-center space-x-1">
                       <Clock className="w-3 h-3" />
                       <span>{tip.read_time || 0} min read</span>
                     </div>
                   </div>

                   <div className="flex items-center justify-between mt-3">
                     <div className="flex items-center space-x-1 text-gray-400">
                       <ThumbsUp className="w-4 h-4" />
                       <span className="text-sm">{tip.likes || 0}</span>
                     </div>
                     <div className="flex flex-wrap gap-1">
                       {(tip.tags || []).slice(0, 2).map((tag) => (
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
         )}
       </TabsContent>

       <TabsContent value="videos" className="mt-8">
         {loadingVideos ? (
           <div className="flex items-center justify-center py-12">
             <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
             <span className="ml-2 text-gray-300">Loading video tutorials...</span>
           </div>
         ) : videoTutorials.length === 0 ? (
           <div className="text-center py-12">
             <p className="text-gray-400 text-lg">No video tutorials available yet.</p>
             <p className="text-gray-500 text-sm mt-2">Check back soon for expert video content!</p>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {videoTutorials.map((video) => (
              <Card
                key={video.id}
                className="bg-black/50 border-white/10 overflow-hidden group hover:border-pink-500/50 transition-all cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative">
                   <img
                     src={video.thumbnail_url || '/images/placeholder.jpg'}
                     alt={video.title}
                     className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                   />
                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <Play className="w-12 h-12 text-white" />
                   </div>
                   <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                     {video.duration || '00:00'}
                   </div>
                   <div className="absolute top-4 left-4">
                     <Badge className="bg-pink-500/20 text-pink-400">
                       {video.category}
                     </Badge>
                   </div>
                 </div>

                 <CardContent className="p-4">
                   <h3 className="text-white font-semibold mb-2 line-clamp-2">{video.title}</h3>
                   <p className="text-gray-300 text-sm mb-3 line-clamp-2">{video.description || 'No description available'}</p>

                   <div className="flex items-center justify-between text-gray-400 text-xs mb-3">
                     <span>{video.author}</span>
                     <span>{(video.views || 0).toLocaleString()} views</span>
                   </div>

                   <div className="flex items-center space-x-1 text-gray-400">
                     <ThumbsUp className="w-4 h-4" />
                     <span className="text-sm">{(video.likes || 0).toLocaleString()}</span>
                   </div>
                </CardContent>
              </Card>
             ))}
           </div>
         )}
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
                    <span>{selectedTip.read_time || 0} min read</span>
                    <span>{selectedTip.likes || 0} likes</span>
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
                src={selectedTip.image_url || '/images/placeholder.jpg'}
                alt={selectedTip.title}
                className="w-full h-64 object-cover rounded mb-6"
              />

              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 whitespace-pre-line">{selectedTip.content}</div>
              </div>

              <div className="flex flex-wrap gap-2 mt-6">
                {(selectedTip.tags || []).map((tag) => (
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
                    <span>{(selectedVideo.views || 0).toLocaleString()} views</span>
                    <span>{(selectedVideo.likes || 0).toLocaleString()} likes</span>
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
                  poster={selectedVideo.thumbnail_url || '/images/placeholder.jpg'}
                >
                  <source src={selectedVideo.video_url} type="video/mp4" />
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